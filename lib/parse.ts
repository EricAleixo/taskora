import nlp from "compromise";

type ParsedTask = {
  title: string;
  start_time: string | null;
  date: string;
};

export function parseTask(text: string): ParsedTask {
  const normalized = text.toLowerCase().trim();
  let cleanText = normalized;
  
  let targetDate = new Date();
  let time: string | null = null;
  let hasRelativeTime = false;
  let dateWasSpecified = false;
  
  // 1. EXTRAÇÃO DE DATA RELATIVA PRIMEIRO
  const datePatterns = [
    { regex: /depois de amanhã/gi, offset: 2 },
    { regex: /amanhã/gi, offset: 1 },
    { regex: /tomorrow/gi, offset: 1 },
    { regex: /hoje/gi, offset: 0 },
    { regex: /today/gi, offset: 0 },
  ];
  
  for (const { regex, offset } of datePatterns) {
    if (regex.test(cleanText)) {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + offset);
      dateWasSpecified = true;
      cleanText = cleanText.replace(regex, "").trim();
      break;
    }
  }
  
  // 2. EXTRAÇÃO DE DIAS DA SEMANA
  const weekdays: Record<string, number> = {
    'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3,
    'quinta': 4, 'sexta': 5, 'sábado': 6
  };
  
  const weekdayPattern = /\b(próxima?|este|essa?)\s+(segunda|terça|quarta|quinta|sexta|sábado|domingo)(?:-feira)?/i;
  const weekdayMatch = cleanText.match(weekdayPattern);
  
  if (weekdayMatch) {
    const targetDay = weekdays[weekdayMatch[2]];
    const today = new Date().getDay();
    let daysToAdd = targetDay - today;
    
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    dateWasSpecified = true;
    cleanText = cleanText.replace(weekdayMatch[0], "").trim();
  }
  
  // 3. EXTRAÇÃO DE "DAQUI A X HORAS/MINUTOS"
  const relativeTimePattern = /daqui\s+a?\s*(\d+)\s*(horas?|minutos?|h|min|m)(?:\s+e\s+(\d+)\s*(minutos?|min|m))?/i;
  const relativeMatch = cleanText.match(relativeTimePattern);
  
  if (relativeMatch) {
    const value1 = parseInt(relativeMatch[1]);
    const unit1 = relativeMatch[2];
    const value2 = relativeMatch[3] ? parseInt(relativeMatch[3]) : 0;
    
    const now = new Date();
    
    if (unit1.startsWith('h') || unit1.startsWith('hora')) {
      now.setHours(now.getHours() + value1);
      now.setMinutes(now.getMinutes() + value2);
    } else if (unit1.startsWith('m') || unit1.startsWith('min')) {
      now.setMinutes(now.getMinutes() + value1);
    }
    
    time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    targetDate = now;
    hasRelativeTime = true;
    dateWasSpecified = true;
    cleanText = cleanText.replace(relativeMatch[0], "").trim();
  }
  
  // 4. EXTRAÇÃO DE HORÁRIO ESPECÍFICO
  if (!hasRelativeTime) {
    const timePatterns = [
      { regex: /(?:às?|das?|de)?\s*(\d{1,2}):(\d{2})/, hourIdx: 1, minIdx: 2 },
      { regex: /(?:às?|das?|de)?\s*(\d{1,2})h(\d{2})?/, hourIdx: 1, minIdx: 2 },
      { regex: /(?:às?|das?|de)\s+(\d{1,2})\s+horas?/, hourIdx: 1, minIdx: null },
    ];
    
    for (const { regex, hourIdx, minIdx } of timePatterns) {
      const match = cleanText.match(regex);
      if (match) {
        const hour = match[hourIdx];
        const minute = minIdx && match[minIdx] ? match[minIdx] : "00";
        time = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
        cleanText = cleanText.replace(match[0], "").trim();
        break;
      }
    }
  }
  
  // 5. LIMPEZA FINAL
  cleanText = cleanText.replace(/^(irei|vou|preciso|quero|tenho que|devo|preciso fazer|vou fazer)\s+/gi, "");
  cleanText = cleanText.replace(/^(de|das?|às?|as|para|pra|em)\s+/gi, "");
  cleanText = cleanText.replace(/\s+(de|das?|às?|as|para|pra)$/gi, "");
  cleanText = cleanText.replace(/\bàs?\b/gi, "");
  cleanText = cleanText.replace(/\s+/g, " ").trim();
  
  // 6. EXTRAÇÃO DA AÇÃO
  const doc = nlp(cleanText);
  let action = doc.match("#Infinitive .+").out("text") ||
               doc.match("#Verb+ .+").out("text") ||
               cleanText;
  
  action = action.replace(/\s+/g, " ").trim();
  
  if (!action) {
    action = "Nova tarefa";
  }
  
  const title = action.charAt(0).toUpperCase() + action.slice(1);
  
  if (!dateWasSpecified) {
    targetDate = new Date();
  }
  
  return {
    title: title.trim(),
    start_time: time,
    date: targetDate.toISOString().split("T")[0],
  };
}

