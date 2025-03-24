import { MemeBaseAgent, MemeTextConfig } from "../../meme-base.agent.class.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

export class DisasterGirlMemeAgentClass extends MemeBaseAgent {
  protected memeConfig: MemeTextConfig = {
    templateName: "disaster-girl",
    textPositions: {
      disaster: { x: 400, y: 250, fontSize: 50, maxWidth: 500, maxCharsPerLine: 25 },
      subject: { x: 1330, y: 820, fontSize: 50, maxWidth: 500, maxCharsPerLine: 20 }
    }
  };

  protected getMemeSchema() {
    return z.object({
      disaster: z.string()
        // .max(120, "Text must be 120 characters or less")
        .describe("The problematic situation or chaos happening in the group or conversation (Text must be 120 characters or less)"),
      subject: z.string()
        // .max(40, "Text must be 40 characters or less")
        .describe("The group member or the group as a whole who is having a mischievous or amused reaction to the situation (Text must be 40 characters or less)")
    });
  }

  protected initializeChain(): void {
    this.outputParser = StructuredOutputParser.fromZodSchema(this.getMemeSchema());

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You create Disaster Girl meme captions that show a chaotic or problematic situation and identify who is having a mischievous or amused reaction to it. The meme should capture both the 'disaster' and who's gleefully reacting to it, similar to how the original meme shows a smiling girl in front of a burning house. The captions should be highly personalized to the conversation provided."],
      ["human", `Create a funny Disaster Girl meme from this conversation. The meme should show:
        1. The chaotic situation or problem (disaster)
        2. The group member or group having a mischievous reaction to it (subject)
        
        The meme should be highly personalized to the conversation.
        Both elements should be discussed or hinted at in the conversation.

        Group conversation: {conversation} 
        
        Format instructions: {format_instructions}`]
    ]);

    this.chain = prompt.pipe(this.model).pipe(this.outputParser);
  }

  async ask(messages: string[]): Promise<[any, any]> {
    if (!this.chain || !this.outputParser) {
      return [null, new Error("Chain or output parser not initialized")];
    }

    const chunks = await this.splitMessages(messages);

    const processChunk = async (chunk: string) => {
      const result = await this.chain!.invoke({
        conversation: chunk,
        format_instructions: this.outputParser!.getFormatInstructions(),
      });
      return result;
    };

    const [results, error] = await this.processBatchWithRetry(chunks, processChunk);
    if (error) {
      return [null, error];
    }

    const finalMeme = await this.consolidateResults(results, async (memes) => {
      const result = await this.chain!.invoke({
        conversation: `Choose the most humorous and relatable disaster/subject pair from these options:\n${JSON.stringify(memes)}`,
        format_instructions: this.outputParser!.getFormatInstructions(),
      });
      return result;
    });

    return [JSON.stringify(finalMeme), null];
  }
} 