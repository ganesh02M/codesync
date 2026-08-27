exports.getAISuggestion = async (req, res) => {
  try {
    const { code, prompt, language } = req.body

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `You are a helpful coding assistant. Language: ${language}\n\nCurrent code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nUser request: ${prompt}\n\nProvide a helpful, concise response. If suggesting code changes, show the complete updated code in a code block.`
        }],
        max_tokens: 1024
      })
    })

    const data = await response.json()
    console.log('Groq status:', response.status)
    console.log('Groq response:', JSON.stringify(data))
    if (data.error) {
      return res.status(500).json({ success: false, message: data.error.message })
    }

    return res.status(200).json({
      success: true,
      response: data.choices[0].message.content
    })
  } catch (error) {
       console.error('getAISuggestion error:', error) 
    return res.status(500).json({ success: false, message: error.message })
  }
}