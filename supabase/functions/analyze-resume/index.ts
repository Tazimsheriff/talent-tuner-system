import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeAnalysisRequest {
  fileBase64: string;
  fileName: string;
  mimeType: string;
  jobDescription: string;
  jobRequirements?: string;
  jobId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    const { fileBase64, fileName, mimeType, jobDescription, jobRequirements, jobId } = await req.json() as ResumeAnalysisRequest;

    // Verify user owns the job
    if (jobId) {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('user_id')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        console.error("Job not found:", jobError);
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (job.user_id !== userId) {
        console.error("User does not own this job");
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing resume: ${fileName} (${mimeType})`);

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Your task is to carefully read and analyze the attached resume document, then compare it with the job description.

IMPORTANT: Read the ACTUAL content from the attached resume document. Extract the REAL information - do not make up or assume any details.

You MUST respond with a valid JSON object only, no additional text. Use this exact structure:
{
  "name": "Full name of the candidate as shown in the resume",
  "email": "Email address from the resume, or null if not found",
  "phone": "Phone number from the resume, or null if not found",
  "skills": ["array", "of", "actual", "skills", "from", "resume"],
  "education": "Actual education details from the resume - degrees, institutions, years",
  "experience": "Actual work experience summary from the resume - companies, roles, duration",
  "matchScore": 85,
  "keyMatches": ["specific skills or requirements that match between resume and job"],
  "missingSkills": ["skills required by job but not found in resume"],
  "summary": "Brief 2-3 sentence analysis explaining WHY the candidate is a good/poor fit. Be specific about strengths and gaps."
}

Match Score Guidelines:
- 90-100: Excellent match, meets almost all requirements with strong relevant experience
- 75-89: Strong match, meets most key requirements with good transferable skills
- 60-74: Moderate match, meets some requirements but has notable gaps
- 40-59: Weak match, limited alignment with significant missing skills
- Below 40: Poor match, does not meet basic requirements

SCORING TRANSPARENCY: Consider contextual similarity, not just keyword matching. Similar technologies, transferable skills, and relevant experience should boost the score. Explain your reasoning in the summary field.`;

    const userPrompt = `JOB DESCRIPTION:
${jobDescription}

${jobRequirements ? `ADDITIONAL REQUIREMENTS:\n${jobRequirements}\n` : ''}

Please analyze the attached resume document and provide the structured JSON response with ACTUAL information from the resume.`;

    console.log("Sending request to Lovable AI with document...");
    
    // Build the messages with the document as an inline data part
    const messages = [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: [
          {
            type: "text",
            text: userPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${fileBase64}`
            }
          }
        ]
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in AI response:", JSON.stringify(data));
      throw new Error("No content in AI response");
    }

    console.log("AI Response received:", content.substring(0, 300));

    // Parse the JSON response
    let analysisResult;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse AI analysis response");
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Resume analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
