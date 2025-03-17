import { CodeSnippet } from "@/components/code-snippet";
import { getProtectedMessage } from "@/services/message.service";

export default async function Student() {
    const { text } = await getProtectedMessage();
    
    return (
        <div className="">
            <CodeSnippet title="Protected Message" code={text} />
            
        Dashboard
      </div>
    );
}
  