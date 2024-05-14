import { DOM_INTERACTION } from "@/constants";
import getChangeLog from "@/lib/getChangeLog";
import getTab from "@/lib/getTab";
import { IExportation } from "@/types";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

function Form() {
  const [version, setVersion] = useState<string>(); 
  const [selectedValue, setSelectedValue] = useState('md');
  const [exportations, setExportations] = useState<IExportation>({
    changelog: true,
    hostsets: true,
    pr: false
  });
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const onChangeCheckbox = (event: ChangeEvent<HTMLInputElement>)=>{
    const key = event.target.name as keyof IExportation;
    const check = exportations[key];
    setExportations({
      ...exportations,
      [key]: !check
    });
  }

  useEffect(()=>{
    setDisabled(
      !Object.entries(exportations).some(([key, value])=> value)
    );
  }, [exportations]);

  const onClickChangelog = useCallback(async ()=>{
    setLoading(true);
    setDisabled(true);
    const tab = await getTab();
    await new Promise((resolve)=>{
      chrome.scripting.executeScript({
        target: { tabId: tab.id || 0 },
        args: [version, selectedValue, exportations],
        func: getChangeLog
      }, resolve);
    });
    setLoading(false);
    setDisabled(false);
  }, [version, selectedValue, exportations]);

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
    <form className="flex-1">
      <div className="row">
        <div className="col-12">
          <p>Exportar: </p>
          <div className="row">
            <div className="col">
              <div className="mb-3">
                <input className="form-check-input" id="changelog" name="changelog" type="checkbox" checked={exportations.changelog} onChange={onChangeCheckbox} disabled={loading} />
                <label htmlFor="changelog" className="form-label ms-1">Changelog</label>
              </div>
            </div>
            <div className="col">
              <div className="mb-3">
                <input className="form-check-input" id="hostsets" name="hostsets" type="checkbox" checked={exportations.hostsets} onChange={onChangeCheckbox} disabled={loading} />
                <label htmlFor="hostsets" className="form-label ms-1">Hostsets</label>
              </div>
            </div>
            <div className="col">
              <div className="mb-3">
                <input className="form-check-input" id="pr" name="pr" type="checkbox" checked={exportations.pr} onChange={onChangeCheckbox} disabled={loading} />
                <label htmlFor="pr" className="form-label ms-1">Pull Requests</label>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="mb-3">
            <label htmlFor="version" className="form-label">Versão</label>
            <input className="form-control" id="version" type="text" defaultValue={version} disabled={loading} />
          </div>
        </div>
        <div className="col">
          <div className="mb-3">
            <label htmlFor="extension-type" className="form-label">Tipo de extensão</label>
            <select className="form-select" name="extension-type" id="extension-type" value={selectedValue} onChange={onSelectExtension} disabled={loading}>
              <option value=""></option>
              <option value="md">Markdown (.md)</option>
              <option value="txt">Text (.txt)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="text-center">
        <button type='button' className='btn btn-primary' onClick={onClickChangelog} disabled={loading || disabled}>
          Extrair changelog
        </button>
      </div>
      { loading && (
        <div className="my-2 text-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}
    </form>
  );
};

export default Form;