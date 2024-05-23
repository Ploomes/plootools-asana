import { IChangelog, IStates, IDownload, IExportation } from "@/types";

async function getChangeLog(currentVersion?: string, currentExtension?: string, exportations?: IExportation){
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
    const { TARGET_ACTOR_NAME, TARGET_FIELDS, TASK_FEED, TASK_TITLE, FEED_COMMENTS } = states.DOM_INTERACTION;
    const { CHANGELOG, EDITOR, FALLBACK_LINK, LINK, TEXT_DESCRIPTION, HOSTSETS } = TARGET_FIELDS;
    const editorHTML = document.querySelector(EDITOR);
    const changelogFieldHTML = document.querySelector(CHANGELOG) as HTMLTextAreaElement;
    const linkHTML  = document.querySelector(LINK) as HTMLTextAreaElement;
    const fallbackLinkHTML = document.querySelector(FALLBACK_LINK) as HTMLLinkElement;
    const textsDescription = editorHTML?.querySelectorAll(TEXT_DESCRIPTION);
    
    const changelog: IChangelog = {
      id: index,
      title: '',
      template: [],
      info: [],
      hostsets: [],
      prs: [],
      linkAsana: ''
    };

    const elementHostsets = document.querySelector(HOSTSETS) as HTMLElement;
    const taskFeed = document.querySelector(TASK_FEED) as HTMLElement;
    const elementTaskTitle = document.querySelector(TASK_TITLE) as HTMLElement;

    if(elementTaskTitle?.textContent) {
      changelog.title = elementTaskTitle.textContent;
    }

    if(exportations?.hostsets) {
      if(elementHostsets?.textContent) {
        let hostsets = elementHostsets.textContent.split(',');
        hostsets = hostsets.map((item)=> item.replace(/\s/g, ''));
        changelog.hostsets = hostsets;
      }
      
      if(taskFeed?.textContent) {
        const reg = /(hostsetid|hostset)(\s\d*)/gi;
        taskFeed?.textContent.match(reg)?.forEach(el=>{
          const id = el.replace(/\D/g, '');
          if(id) changelog.hostsets.push(id);
        });
      }
    }

    if(exportations?.pr) {
      taskFeed.querySelectorAll('a')?.forEach(el=>{
        const href = el.getAttribute('href');
        const text = el.textContent;
        const hostname = 'github.com';
        if(href?.includes(hostname) || text?.includes(hostname)) {
          changelog.prs.push(href || text || '');
        }
      });
    }

    if(changelogFieldHTML) {
      const value = changelogFieldHTML.value;
      let client = '';
      let creator = '';
      const link = linkHTML?.value || fallbackLinkHTML?.href;

      changelog.linkAsana = fallbackLinkHTML?.href;
      
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

      if(!client) {
        const firtsComment = document.querySelector(FEED_COMMENTS.ITEMS);
        if(firtsComment?.textContent) {
          client = firtsComment.textContent.split('-')?.[0];
        }
      }

      if(!creator) {
        const actorName = document.querySelector(TARGET_ACTOR_NAME) as HTMLElement;
        const actorNameField = document.querySelector(TARGET_FIELDS.ACTOR_NAME) as HTMLElement;
        creator = actorNameField?.textContent || actorName?.textContent || actorName?.innerText;
      }
 
      changelog.template = [
        `**Link:** ${link}`,
        `**Cliente:** ${client.trim() || 'Ploomes'}`,
        `**Descrição:** ${value}`,
        `**Criador:** ${creator.trim()}`,
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

    const fileExtension = currentExtension || 'md';

    const concatHostsets = changelog.map((item)=> item.hostsets);
    const pullRequests = changelog.map((item)=> {
      return {
        title: item.title,
        linkAsana: item.linkAsana,
        prs: [...new Set(item.prs)]
      }
    });
    const mergedHostsets = [...new Set(concatHostsets.flat(1))];

    const hostsetsNumbers = mergedHostsets.map((item)=> Number(item)).sort((a, b)=> a - b);
    const hostsetsAffected = hostsetsNumbers.join(', ');
    const changelogText = changelog.map((item)=>{
      return item?.template.join('\n');
    }).join('\n\n');
    let template = [];

    if(exportations?.changelog) {
      template.push(
        'Bugs resolvidos',
        '-------------',
        changelogText,
        '',
      );
    }

    if(exportations?.hostsets) {
      template.push(
        'Hostsets',
        '-----------',
        hostsetsAffected,
        '',
      );
    }

    if(exportations?.changelog) {
      template.push(
        'Versões',
        '-----------',
        '',
        'Propagação',
        '------------'
      );
    }

    const fileName = currentVersion || version.textContent || version.innerText || 'version';
    const changelogTemplate: string[] = [].concat(...Array(5).fill(''));
    
    if(exportations?.changelog) {
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
    }

    if(exportations?.changelog) {
      changelogTemplate.push(changelogText);
    }

    template = template.concat(changelogTemplate.join('\n'))

    if(exportations?.pr) {
      if(template.length) {
        template.push('', '');
      }
      template.push(
        'Pull Requests',
        '--------------'
      );

      pullRequests.forEach((item)=>{
        template.push(
          '',
          `**Título da tarefa:** ${item.title} <br/>`,
          `[**Link da tarefa**](${item.linkAsana}) <br/>`,
          '**Pull requests:**',
        );
        item.prs.forEach((pr, index) => {
          template.push(
            `${index + 1}. [${pr}](${pr})`
          );
        });
      });
    }

    download({
      name: `${fileName}.${fileExtension}`,
      data: template.join('\n').trim(),
      type: 'text/plain'
    });
    
  }
};

export default getChangeLog;