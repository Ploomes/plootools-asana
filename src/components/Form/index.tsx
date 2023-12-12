import { DOM_INTERACTION } from "@/constants";
import getChangeLog from "@/lib/getChangeLog";
import { Button, FormGroup, Input, Select } from "@styles/Components";
import { useCallback, useEffect, useState } from "react";

function Form() {
  const [version, setVersion] = useState<string>(); 
  const [selectedValue, setSelectedValue] = useState('md');
  const getTab = async ()=> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
  const onClickChangelog = useCallback(async ()=>{
    const tab = await getTab();
    await chrome.scripting.executeScript({
      target: { tabId: tab.id || 0 },
      args: [version, selectedValue],
      func: getChangeLog
    });
  }, [version, selectedValue]);

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

  const onSelectExtension = useCallback((event: React.ChangeEvent<HTMLSelectElement>)=>{
    const value = event.currentTarget.value;
    setSelectedValue(value);
  }, []);

  return (
    <form className="flex-1 text-center">
      <div className="group-field">
        <FormGroup className="w-40">
          <label htmlFor="version">Versão</label>
          <Input id="version" type="text" defaultValue={version} />
        </FormGroup>
        <FormGroup className="flex-1">
          <label htmlFor="extension-type">Tipo de extensão</label>
          <Select name="extension-type" id="extension-type" value={selectedValue} onChange={onSelectExtension}>
            <option value="md">Markdown (.md)</option>
            <option value="txt">Text (.txt)</option>
          </Select>
        </FormGroup>
      </div>
      <Button type='button' className='btn primary' onClick={onClickChangelog}>
        Extrair changelog
      </Button>
    </form>
  );
};

export default Form;