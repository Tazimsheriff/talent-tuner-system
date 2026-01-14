import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeAnalysisRequest {
  resumeText: string;
  jobDescription: string;
  jobRequirements?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription, jobRequirements } = await req.json() as ResumeAnalysisRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Your task is to analyze resumes against job descriptions and provide structured data.

Analyze the resume and extract the following information, then compare it with the job description to calculate a match score.

You MUST respond with a valid JSON object only, no additional text. Use this exact structure:
{
  "name": "Full name of the candidate",
  "email": "Email address if found, or null",
  "phone": "Phone number if found, or null",
  "skills": ["array", "of", "extracted", "skills"],
  "education": "Summary of education background",
  "experience": "Summary of work experience with years if available",
  "matchScore": 85,
  "keyMatches": ["skill or requirement that matches the job"],
  "missingSkills": ["skills required by job but not found in resume"],
  "summary": "Brief 2-3 sentence analysis of candidate fit"
}

Match Score Guidelines:
- 90-100: Excellent match, meets almost all requirements
- 75-89: Strong match, meets most key requirements
- 60-74: Moderate match, meets some requirements
- 40-59: Weak match, limited alignment
- Below 40: Poor match, significant gaps

Consider contextual similarity, not just keyword matching. Similar technologies, transferable skills, and relevant experience should boost the score.`;

    const userPrompt = `JOB DESCRIPTION:
${jobDescription}

${jobRequirements ? `ADDITIONAL REQUIREMENTS:\n${jobRequirements}\n` : ''}

RESUME CONTENT:
${resumeText}

Analyze this resume against the job description and provide the structured JSON response.`;

    console.log("Sending request to Lovable AI...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response received:", content.substring(0, 200));

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
