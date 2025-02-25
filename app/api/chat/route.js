import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `
Welcome to HeadstarterAI Support! 🌟

I’m here to assist you with all your questions and concerns regarding our AI-powered interview platform. Whether you need help navigating our features, troubleshooting issues, or understanding how to maximize your interview process, I’ve got you covered.

Here’s what I can help you with:
- Platform Navigation: Guidance on how to use our tools and features effectively.
- Interview Setup: Assistance with scheduling and configuring AI interviews.
- Technical Issues: Troubleshooting any problems you encounter with our platform.
- Account Management: Help with account settings, subscription plans, and billing inquiries.
- Best Practices: Tips and advice for preparing for and performing well in AI-powered interviews.

To get started, simply type your question or describe the issue you’re facing. If you need to speak with a live representative, just let me know, and I’ll connect you with someone from our support team.

Thank you for choosing HeadstarterAI, and I look forward to helping you succeed in your software engineering journey! 🚀
`
// POST function that handles incoming request 
export async function POST(req){
    const openai = new OpenAI() // New Instance of OpenAI client
    const data = await req.json() // 

    const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system', 
            content: systemPrompt,
          },
          ...data,
        ],
        model:'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                         const text = encoder.encode(content)
                         controller.enqueue(text)
                    }
                }
            }
            catch(error){
                controller.error(err)
            }
            finally{
                controller.close()
            }
        },
    }) 

    return new NextResponse(stream)
}