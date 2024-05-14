import { DOM_INTERACTION } from "@/constants";
import getHostsets from "@/lib/getHostsets";
import getTab from "@/lib/getTab";
import { useEffect, useState } from "react";

function Hostsets() {
  const [version, setVersion] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [hostsets, setHostsets] = useState<string>('');
  
  async function onClickHostsets() {
    setLoading(true);
    const tab = await getTab();
    const list = await new Promise<string[]>(resolve => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id || 0 },
        args: [version],
        func: getHostsets
      }, (response)=> resolve(response[0].result));
    });
    setLoading(false);
    setHostsets(list.map((val)=> parseInt(val)).sort((a, b)=> a-b).join(', '));
  }

  useEffect(()=>{
    (async()=>{
      const tab = await getTab();
      const [versionResponse] = await chrome.scripting.executeScript({
        target: { tabId: tab.id || 0 },
        args: [DOM_INTERACTION.TARGET_TITLE],
        func: function(target_title) {
          const elementVersion = document.querySelector(target_title) as HTMLElement;
          const version = elementVersion?.textContent || elementVersion?.innerText;
          return version;
        }
      });
      setVersion(versionResponse.result);
    })();
  }, [])
  return(
    <div className="flex-1 text-center">
      <div>
        <textarea rows={5} disabled={loading} value={hostsets}>
          {hostsets}
        </textarea>
      </div>
      <button type='button' className='btn primary' onClick={onClickHostsets} disabled={loading}>
        Extrair Hostsets
      </button>
    </div>
  );
};

export default Hostsets;