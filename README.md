# KIMI Clone: An Open-Source AI Research Assistant

This project was born from a simple idea: **access to powerful AI should not be locked behind expensive subscriptions**.  
**KIMI Clone** is an open-source, self-hostable alternative to services like Kimi, Perplexity, and ChatGPT — built to leverage the generous free tiers offered by API providers like [OpenRouter](https://openrouter.ai).

It’s a testament to the power of open-source tools and a step towards **democratizing access** to high-quality AI models without the needless cost.

This repository contains the complete backend and frontend code to run your own advanced AI chat application.

---

## ✨ Features

- **Multi-Model Support**  
  Easily configure and switch between various powerful LLMs from providers like Qwen, Mistral, Google, and more via OpenRouter.

- **Vision Capabilities**  
  Analyze images using multimodal models.

- **Advanced Reasoning Pipeline**  
  A two-step process where the AI "thinks" before answering, leading to higher-quality, more detailed responses.

- **Integrated Web Search**  
  A "Researcher" mode that uses SerpApi to fetch real-time web results and incorporate them into the AI's answers.

- **User Authentication & Chat History**  
  Secure user accounts with JWT and persistent, saved conversation histories.

- **Real-time Streaming**  
  AI responses are streamed token-by-token for a smooth, interactive experience.

---

## 🧠 Technology Stack

- **Backend**: Node.js, Express.js, Mongoose, JSON Web Token (JWT)  
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Radix UI  
- **Database**: MongoDB  
- **Core Services**: 
  - [OpenRouter API](https://openrouter.ai) (for LLMs)  
  - [SerpApi](https://serpapi.com) (for real-time web search)

---

## 🚀 Getting Started

Follow these steps to run the application locally:

### 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- A running **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud)
- API keys from:
  - [OpenRouter](https://openrouter.ai)
  - [SerpApi](https://serpapi.com)

---

> 📁 Stay tuned for installation and usage instructions in the next section.
