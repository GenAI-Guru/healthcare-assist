import os
from fastapi import FastAPI, Depends  # type: ignore
from fastapi.responses import StreamingResponse  # type: ignore
from fastapi_clerk_auth import ClerkConfig, ClerkHTTPBearer, HTTPAuthorizationCredentials  # type: ignore
from openai import OpenAI  # type: ignore

app = FastAPI()

clerk_config = ClerkConfig(jwks_url=os.getenv("CLERK_JWKS_URL"))
clerk_guard = ClerkHTTPBearer(clerk_config)


@app.get("/api")
def consult(creds: HTTPAuthorizationCredentials = Depends(clerk_guard)):
    user_id = creds.decoded["sub"]  # User ID from JWT - available for future use
    # We now know which user is making the request!
    # You could use user_id to:
    # - Track usage per clinician
    # - Store generated drafts in a database
    # - Apply user-specific limits or customization

    client = OpenAI()
    prompt = [
        {
            "role": "user",
            "content": (
                "You are healthcare-assist, a clinical documentation assistant. "
                "Using a realistic but fictional outpatient visit (no real PHI), "
                "reply with three sections formatted with headings, sub-headings, "
                "and bullet points: (1) Professional visit summary for the chart, "
                "(2) Action items for the doctor, and (3) a patient-friendly "
                "follow-up email."
            ),
        }
    ]
    stream = client.chat.completions.create(
        model="gpt-5-nano", messages=prompt, stream=True
    )

    def event_stream():
        for chunk in stream:
            text = chunk.choices[0].delta.content
            if text:
                lines = text.split("\n")
                for line in lines[:-1]:
                    yield f"data: {line}\n\n"
                    yield "data:  \n"
                yield f"data: {lines[-1]}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
