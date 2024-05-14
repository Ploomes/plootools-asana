import { IStates } from "@/types";

async function getHostsets(version?: string) {
  const { states } = await chrome.storage.local.get('states') as {
    states: IStates
  };
  const tasks = document.querySelectorAll(states.DOM_INTERACTION.TARGET_LINE_OF_TASK);
  const hostsets: string[] = [];

  async function getHostset(index: number) {
    const { TARGET_FIELDS, TASK_FEED } = states.DOM_INTERACTION;
    const { HOSTSETS } = TARGET_FIELDS;
    let data: string[] = [];

    const elementHostsets = document.querySelector(HOSTSETS) as HTMLElement;
    if(elementHostsets?.textContent) {
      let hostsets = elementHostsets.textContent.split(',');
      hostsets = hostsets.map((item)=> item.replace(/\s/g, ''));
      data = hostsets;
    }

    const taskFeed = document.querySelector(TASK_FEED) as HTMLElement;
    if(taskFeed?.textContent) {
      const reg = /(hostsetid|hostset)(\s\d*)/gi;
      taskFeed?.textContent.match(reg)?.forEach(el=>{
        const id = el.replace(/\D/g, '');
        if(id) data.push(id);
      });
    }
    return data;
  }

  if(tasks.length) {
    let index = 0;
    let max = 5;
    let interval: NodeJS.Timer;
    for(const task of tasks) {
      const clickableArea = task.querySelector(states.DOM_INTERACTION.TARGET_CLICKABLE_AREA) as HTMLElement;
      clickableArea.click();
      await new Promise<string[]>((resolve)=>{
        interval = setInterval(()=>{
          const template = getHostset(index);
          max--;
          if(max <= 0 || template) {
            clearInterval(interval);
            resolve(template);
            max = 5;
          }
        }, 500);
      }).then((response)=>{
        hostsets.push(...response);
      });
      index++;
    }
  }
  return [...new Set(hostsets)];
}

export default getHostsets;