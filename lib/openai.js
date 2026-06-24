export async function callOpenAI(openai, messages) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response. Please try again.");
  }

  return content;
}
