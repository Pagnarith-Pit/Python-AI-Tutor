## This repo is on Python Tutor

# What is it about?
This project aims to build an open-source, AI-powered Python tutor. By combining state-of-the-art language models with custom fine-tuning, it will deliver interactive, personalized guidance—helping learners debug code, understand core concepts, and progress at their own pace.

# Project Main Impact
1. **AI fine-tuning**  
   AI remains an imperfect tutor, yet it offers infinite potential for instant feedback and customized learning paths. This project focuses on tuning model behavior—optimizing hint depth, follow-up questions, and feedback style—to maximize pedagogical value and improve the quality and relevance of responses. The main challenge is to maximize intended behaviour while minimizing catastrophic forgetting.

2. **Large content handling via efficient search & retrieval**  
   Even modern models with extended context windows (e.g., Qwen-2.5-1M) struggle with very long inputs. When processing large files or codebases, many LLMs (including GPT-3.0) default to basic search, leading to hallucinations or sub-par results. We aim to develop robust retrieval-augmented generation techniques—semantic chunking, vector indexing, and dynamic context prioritization—to reliably handle extensive content.

# Target User
Initially university students learning Python fundamentals. Ultimately, we plan to open the platform to all self-learners, bootcamp participants, and coding enthusiasts worldwide.

# Stage
**Experimental.** We welcome your feedback, bug reports, and feature suggestions—every comment helps us improve!

# AI Usage
Developed and iterated with help from:
- **Loveable** (prototyping & initial dialogue scaffolding)  
- **Anthropic Claude Sonnet 3.7** (exploratory question generation)  
- **OpenAI GPT-4** (fine-tuning, validation, and performance benchmarking) 
