import { IChangelog, IStates, IDownload } from "@/types";

async function getChangeLog(currentVersion?: string, currentExtension?: string){
  const { states } = await chrome.storage.local.get('states') as {
    states: IStates
  };

  const download = (props: IDownload)=>{
    const { name, data, type } = props;
    const a = document.createElement('a');
    const file = new Blob([data], { type });
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.textContent = 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  const getTemplate = (index: number)=> {
    const { TARGET_ACTOR_NAME, TARGET_FIELDS } = states.DOM_INTERACTION;
    const { CHANGELOG, EDITOR, FALLBACK_LINK, LINK, TEXT_DESCRIPTION, HOSTSETS } = TARGET_FIELDS;
    const editorHTML = document.querySelector(EDITOR);
    const changelogFieldHTML = document.querySelector(CHANGELOG) as HTMLTextAreaElement;
    const linkHTML  = document.querySelector(LINK) as HTMLTextAreaElement;
    const fallbackLinkHTML = document.querySelector(FALLBACK_LINK) as HTMLLinkElement;
    const textsDescription = editorHTML?.querySelectorAll(TEXT_DESCRIPTION);
    
    const changelog: IChangelog = {
      id: index,
      template: [],
      info: [],
      hostsets: []
    };

    const elementHostsets = document.querySelector(HOSTSETS) as HTMLElement;
    if(elementHostsets?.textContent) {
      let hostsets = elementHostsets.textContent.split(',');
      hostsets = hostsets.map((item)=> item.replace(/\s/g, ''));
      changelog.hostsets = hostsets;
    }

    if(changelogFieldHTML) {
      const value = changelogFieldHTML.value;
      let client = 'Ploomes';
      let creator = '';
      const link = linkHTML?.value || fallbackLinkHTML?.href;
      
      textsDescription?.forEach(text=> {
        const originalText = text.textContent;
        const textContent = originalText?.toLowerCase();
        if(textContent) {
          if(textContent?.startsWith('criador')) {
            creator = originalText?.split(':')?.[1] || '';
          }
          if(textContent?.startsWith('cliente')) {
            client = originalText?.split(':')?.[1] || ''
          }
        }
      });



      if(!creator) {
        const actorName = document.querySelector(TARGET_ACTOR_NAME) as HTMLElement;
        const actorNameField = document.querySelector(TARGET_FIELDS.ACTOR_NAME) as HTMLElement;
        creator = actorNameField.textContent || actorName.textContent || actorName.innerText;
      }
 
      changelog.template = [
        `**Link:** ${link}`,
        `**Cliente:** ${client.trim()}`,
        `**Descrição:** ${value}`,
        `**Criador:** ${creator.trim()}`
      ];
      return changelog;
    }
  }
  const tasks = document.querySelectorAll(states.DOM_INTERACTION.TARGET_LINE_OF_TASK);
  const version = document.querySelector(states.DOM_INTERACTION.TARGET_TITLE) as HTMLElement;
  const changelog: Array<IChangelog> = [];
  if(tasks.length) {
    let index = 0;
    let max = 5;
    let interval: NodeJS.Timer;
    for(const task of tasks) {
      const clickableArea = task.querySelector(states.DOM_INTERACTION.TARGET_CLICKABLE_AREA) as HTMLElement;
      clickableArea.click();
      await new Promise((resolve)=>{
        interval = setInterval(()=>{
          const template = getTemplate(index);
          max--;
          if(max <= 0 || template) {
            clearInterval(interval);
            resolve(template);
            max = 5;
          }
        }, 500);
      }).then((response)=>{
        changelog.push(response as IChangelog);
      });
      index++;
    }

    const concatHostsets = changelog.map((item)=> item.hostsets);
    const mergedHostsets = [...new Set(concatHostsets.flat(1))];
    const hostsetsNumbers = mergedHostsets.map((item)=> Number(item)).sort((a, b)=> a - b);
    const hostsetsAffected = hostsetsNumbers.join(', ');
    const changelogText = changelog.map((item)=>{
      return item?.template.join('\n');
    }).join('\n\n');
    let template = [
      'Bugs resolvidos',
      '-------------',
      changelogText,
      '',
      'Hostsets',
      '-----------',
      hostsetsAffected,
      '',
      'Versões',
      '-----------',
      '',
      'Propagação',
      '------------'
    ]
    const fileName = currentVersion || version.textContent || version.innerText || 'version';
    const changelogTemplate: string[] = [].concat(...Array(5).fill(''));
    if(/[a-z]$/g.test(fileName)) {
      changelogTemplate.push(
        '**======================================',
        '=== Deploy de hotfix para Ploomes (web)',
        '======================================',
        ':purple_circle: Versão interna: `' + fileName + '`',
        ':purple_circle: Hostsets atingidos: `'+hostsetsAffected+'`',
        '======================================',
        '',
        '--------------------------------------',
        '| Bugs resolvidos:',
        '--------------------------------------**',
        '',
      );
    }else {
      changelogTemplate.push(
        '** :warning: Pacote de atualizações para Ploomes (web)',
        '',
        ':purple_circle: Versão interna: `' + fileName + '`',
        ':purple_circle: Hostsets inicialmente atingidos: `'+hostsetsAffected+'`',
        '--------------------------------------',
        '| Bugs Resolvidos:',
        '--------------------------------------**',
        ''
      )
    }
    changelogTemplate.push(changelogText);
    template = template.concat(changelogTemplate.join('\n'))

    const fileExtension = currentExtension || 'md';
    download({
      name: `${fileName}.${fileExtension}`,
      data: template.join('\n').trim(),
      type: 'text/plain'
    });
    
  }
};

export default getChangeLog;