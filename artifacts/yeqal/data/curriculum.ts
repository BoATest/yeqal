import { AppLanguage, Subject } from "./types";

export interface CurriculumTopic {
  name: string;
  subject: Subject;
  keywords: string[];
  amharicTerms: string[];
  oromoTerms: string[];
  gradeLabel: string;
}

export interface GradeCurriculum {
  amharic: CurriculumTopic[];
  oromo: CurriculumTopic[];
  english: CurriculumTopic[];
}

export const CURRICULUM: Record<string, GradeCurriculum> = {
  grade1: {
    amharic: [
      {
        name: "Family",
        subject: "family",
        gradeLabel: "Grade 1 Amharic",
        keywords: ["mother", "father", "sister", "brother", "home", "family", "እናት", "አባት", "እህት", "ወንድም", "ቤት"],
        amharicTerms: ["እናት", "አባት", "እህት", "ወንድም", "ቤት", "ቤተሰብ"],
        oromoTerms: ["Haadha", "Abbaa", "Obboleettii", "Obboleessa", "Mana", "Maatii"],
      },
      {
        name: "Body Parts",
        subject: "body",
        gradeLabel: "Grade 1 Amharic",
        keywords: ["head", "hand", "foot", "eye", "ear", "nose", "mouth", "ራስ", "እጅ", "እግር", "ዓይን", "ጆሮ", "አፍንጫ"],
        amharicTerms: ["ራስ", "እጅ", "እግር", "ዓይን", "ጆሮ", "አፍንጫ", "አፍ"],
        oromoTerms: ["Mataa", "Harka", "Miila", "Ija", "Gurra", "Funyaan", "Afaan"],
      },
      {
        name: "Animals",
        subject: "animals",
        gradeLabel: "Grade 1 Amharic",
        keywords: ["cow", "horse", "lion", "bird", "fish", "dog", "ላም", "ፈረስ", "አንበሳ", "ወፍ", "ዓሳ", "ውሻ"],
        amharicTerms: ["ላም", "ፈረስ", "አንበሳ", "ወፍ", "ዓሳ", "ውሻ"],
        oromoTerms: ["Sa'a", "Farda", "Leenca", "Simbiroo", "Qurxummii", "Saree"],
      },
      {
        name: "Numbers 1–10",
        subject: "numbers",
        gradeLabel: "Grade 1 Amharic",
        keywords: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
        amharicTerms: ["አንድ", "ሁለት", "ሦስት", "አራት", "አምስት", "ስድስት", "ሰባት", "ስምንት", "ዘጠኝ", "አሥር"],
        oromoTerms: ["Tokko", "Lama", "Sadi", "Afur", "Shan", "Ja'a", "Torba", "Saddet", "Sagal", "Kudhan"],
      },
    ],
    oromo: [
      {
        name: "Family",
        subject: "family",
        gradeLabel: "Grade 1 Oromo",
        keywords: ["haadha", "abbaa", "obboleettii", "obboleessa", "mana", "maatii"],
        amharicTerms: ["እናት", "አባት", "እህት", "ወንድም", "ቤት"],
        oromoTerms: ["Haadha", "Abbaa", "Obboleettii", "Obboleessa", "Mana"],
      },
      {
        name: "Animals",
        subject: "animals",
        gradeLabel: "Grade 1 Oromo",
        keywords: ["sa'a", "farda", "leenca", "simbiroo", "qurxummii"],
        amharicTerms: ["ላም", "ፈረስ", "አንበሳ", "ወፍ", "ዓሳ"],
        oromoTerms: ["Sa'a", "Farda", "Leenca", "Simbiroo", "Qurxummii"],
      },
    ],
    english: [
      {
        name: "Family & Home",
        subject: "family",
        gradeLabel: "Grade 1 English",
        keywords: ["mother", "father", "sister", "brother", "home", "family", "house"],
        amharicTerms: ["እናት", "አባት", "እህት", "ወንድም", "ቤት"],
        oromoTerms: ["Haadha", "Abbaa", "Obboleettii", "Obboleessa", "Mana"],
      },
    ],
  },
  grade2: {
    amharic: [
      {
        name: "Colors",
        subject: "colors",
        gradeLabel: "Grade 2 Amharic",
        keywords: ["red", "blue", "green", "yellow", "white", "black", "color", "ቀይ", "ሰማያዊ", "አረንጓዴ", "ቢጫ", "ነጭ", "ጥቁር"],
        amharicTerms: ["ቀይ", "ሰማያዊ", "አረንጓዴ", "ቢጫ", "ነጭ", "ጥቁር"],
        oromoTerms: ["Diimaa", "Cuquliisaa", "Magariisa", "Keelloo", "Adii", "Gurraacha"],
      },
      {
        name: "Clothes",
        subject: "clothes",
        gradeLabel: "Grade 2 Amharic",
        keywords: ["shirt", "shoes", "dress", "clothes", "wear", "ሸሚዝ", "ጫማ", "ቀሚስ"],
        amharicTerms: ["ሸሚዝ", "ጫማ", "ቀሚስ", "ልብስ"],
        oromoTerms: ["Shaartiilee", "Kophee", "Uffata"],
      },
      {
        name: "Weather",
        subject: "weather",
        gradeLabel: "Grade 2 Amharic",
        keywords: ["hot", "cold", "rain", "wind", "sun", "weather", "ሞቃት", "ቀዝቃዛ", "ዝናብ", "ንፋስ"],
        amharicTerms: ["ሞቃት", "ቀዝቃዛ", "ዝናብ", "ንፋስ", "ፀሐይ"],
        oromoTerms: ["Ho'aa", "Qorraa", "Rooba", "Qilleensa", "Aduu"],
      },
    ],
    oromo: [
      {
        name: "Colors",
        subject: "colors",
        gradeLabel: "Grade 2 Oromo",
        keywords: ["diimaa", "cuquliisaa", "magariisa", "keelloo", "adii", "gurraacha"],
        amharicTerms: ["ቀይ", "ሰማያዊ", "አረንጓዴ", "ቢጫ", "ነጭ", "ጥቁር"],
        oromoTerms: ["Diimaa", "Cuquliisaa", "Magariisa", "Keelloo", "Adii", "Gurraacha"],
      },
    ],
    english: [
      {
        name: "Colors & Shapes",
        subject: "colors",
        gradeLabel: "Grade 2 English",
        keywords: ["red", "blue", "green", "yellow", "white", "black", "circle", "square", "triangle"],
        amharicTerms: ["ቀይ", "ሰማያዊ", "አረንጓዴ", "ቢጫ", "ነጭ", "ጥቁር", "ክብ", "ካሬ"],
        oromoTerms: ["Diimaa", "Cuquliisaa", "Magariisa", "Keelloo", "Adii", "Gurraacha"],
      },
    ],
  },
  grade3: {
    amharic: [
      {
        name: "Actions & Verbs",
        subject: "actions",
        gradeLabel: "Grade 3 Amharic",
        keywords: ["eat", "drink", "run", "walk", "read", "write", "listen", "ብላ", "ጠጣ", "ሮጥ", "ሂድ", "አንብብ", "ጻፍ"],
        amharicTerms: ["ብላ", "ጠጣ", "ሮጥ", "ሂድ", "አንብብ", "ጻፍ", "ስማ"],
        oromoTerms: ["Nyaadhu", "Dhugi", "Fiigi", "Deemi", "Dubbisi", "Barreessi", "Caqasi"],
      },
      {
        name: "Nature & Plants",
        subject: "nature",
        gradeLabel: "Grade 3 Amharic",
        keywords: ["soil", "seed", "plant", "root", "leaf", "fruit", "tree", "አፈር", "ዘር", "ተክል", "ሥር", "ቅጠል", "ፍሬ"],
        amharicTerms: ["አፈር", "ዘር", "ተክል", "ሥር", "ቅጠል", "ፍሬ", "ዛፍ"],
        oromoTerms: ["Lafa", "Sanyii", "Biqilaa", "Hidda", "Baala", "Firii", "Muka"],
      },
    ],
    oromo: [
      {
        name: "Nature & Plants",
        subject: "nature",
        gradeLabel: "Grade 3 Oromo",
        keywords: ["lafa", "sanyii", "biqilaa", "hidda", "baala", "firii"],
        amharicTerms: ["አፈር", "ዘር", "ተክል", "ሥር", "ቅጠል", "ፍሬ"],
        oromoTerms: ["Lafa", "Sanyii", "Biqilaa", "Hidda", "Baala", "Firii"],
      },
    ],
    english: [
      {
        name: "Nature & Science",
        subject: "nature",
        gradeLabel: "Grade 3 English",
        keywords: ["soil", "seed", "plant", "root", "leaf", "fruit", "tree", "water", "air"],
        amharicTerms: ["አፈር", "ዘር", "ተክል", "ሥር", "ቅጠል", "ፍሬ"],
        oromoTerms: ["Lafa", "Sanyii", "Biqilaa", "Hidda", "Baala", "Firii"],
      },
    ],
  },
  grade4: {
    amharic: [
      {
        name: "Community & Places",
        subject: "community",
        gradeLabel: "Grade 4 Amharic",
        keywords: ["market", "hospital", "church", "school", "government", "neighborhood", "ሰፈር", "ገበያ", "ቤተ ክርስቲያን", "ትምህርት ቤት", "ሆስፒታል", "መንግሥት"],
        amharicTerms: ["ሰፈር", "ገበያ", "ቤተ ክርስቲያን", "ትምህርት ቤት", "ሆስፒታል", "መንግሥት"],
        oromoTerms: ["Gandaa", "Gabaa", "Waldaa", "Mana Barumsaa", "Hospitaala", "Mootummaa"],
      },
      {
        name: "Environment",
        subject: "nature",
        gradeLabel: "Grade 4 Amharic",
        keywords: ["forest", "river", "mountain", "soil", "water", "air", "environment", "ደን", "ወንዝ", "ተራራ", "አፈር", "ውሃ", "አየር"],
        amharicTerms: ["ደን", "ወንዝ", "ተራራ", "አፈር", "ውሃ", "አየር"],
        oromoTerms: ["Bosona", "Laga", "Tullu", "Lafa", "Bishaani", "Haayyu"],
      },
    ],
    oromo: [
      {
        name: "Community",
        subject: "community",
        gradeLabel: "Grade 4 Oromo",
        keywords: ["gabaa", "hospitaala", "waldaa", "mana barumsaa", "mootummaa"],
        amharicTerms: ["ገበያ", "ሆስፒታል", "ቤተ ክርስቲያን", "ትምህርት ቤት", "መንግሥት"],
        oromoTerms: ["Gabaa", "Hospitaala", "Waldaa", "Mana Barumsaa", "Mootummaa"],
      },
    ],
    english: [
      {
        name: "Community & Environment",
        subject: "community",
        gradeLabel: "Grade 4 English",
        keywords: ["market", "hospital", "church", "school", "government", "forest", "river", "mountain"],
        amharicTerms: ["ገበያ", "ሆስፒታል", "ቤተ ክርስቲያን", "ትምህርት ቤት", "ደን", "ወንዝ"],
        oromoTerms: ["Gabaa", "Hospitaala", "Waldaa", "Mana Barumsaa", "Bosona", "Laga"],
      },
    ],
  },
  grade5: {
    amharic: [
      {
        name: "Mathematics",
        subject: "math",
        gradeLabel: "Grade 5 Amharic",
        keywords: ["add", "subtract", "multiply", "divide", "equal", "number", "fraction", "ደምር", "ቀነስ", "አባዛ", "ቀሰም", "እኩል", "ቁጥር"],
        amharicTerms: ["ደምር", "ቀነስ", "አባዛ", "ቀሰም", "እኩል", "ቁጥር", "ክፍልፋይ"],
        oromoTerms: ["Ida'i", "Hir'isi", "Baay'isi", "Hirmaasi", "Wal-qixa", "Lakkoofsa"],
      },
      {
        name: "Geography",
        subject: "geography",
        gradeLabel: "Grade 5 Amharic",
        keywords: ["country", "city", "village", "border", "map", "ሃገር", "ከተማ", "ቀበሌ", "ድንበር", "ካርታ"],
        amharicTerms: ["ሃገር", "ከተማ", "ቀበሌ", "ድንበር", "ካርታ", "ክፍለ ሃገር"],
        oromoTerms: ["Biyya", "Magaalaa", "Ganda", "Daangaa", "Kaartaa", "Naannoo"],
      },
    ],
    oromo: [
      {
        name: "Geography",
        subject: "geography",
        gradeLabel: "Grade 5 Oromo",
        keywords: ["biyya", "magaalaa", "ganda", "daangaa", "kaartaa"],
        amharicTerms: ["ሃገር", "ከተማ", "ቀበሌ", "ድንበር", "ካርታ"],
        oromoTerms: ["Biyya", "Magaalaa", "Ganda", "Daangaa", "Kaartaa"],
      },
    ],
    english: [
      {
        name: "Math & Geography",
        subject: "math",
        gradeLabel: "Grade 5 English",
        keywords: ["add", "subtract", "multiply", "equal", "number", "country", "city", "border"],
        amharicTerms: ["ደምር", "ቀነስ", "አባዛ", "እኩል", "ሃገር", "ከተማ"],
        oromoTerms: ["Ida'i", "Hir'isi", "Baay'isi", "Wal-qixa", "Biyya", "Magaalaa"],
      },
    ],
  },
  grade6: {
    amharic: [
      {
        name: "History & Culture",
        subject: "history",
        gradeLabel: "Grade 6 Amharic",
        keywords: ["king", "battle", "tradition", "culture", "history", "ንጉሥ", "ጦርነት", "ባህል", "ታሪክ"],
        amharicTerms: ["ንጉሥ", "ጦርነት", "ባህል", "ታሪክ", "ሥርወ-መንግሥት"],
        oromoTerms: ["Mootii", "Lola", "Aadaa", "Seenaa"],
      },
      {
        name: "Science",
        subject: "science",
        gradeLabel: "Grade 6 Amharic",
        keywords: ["energy", "electricity", "machine", "experiment", "science", "ሃይል", "ኤሌክትሪክ", "ማሽን", "ሙከራ"],
        amharicTerms: ["ሃይል", "ኤሌክትሪክ", "ማሽን", "ሙከራ", "ሳይንስ"],
        oromoTerms: ["Humna", "Ibsaa", "Maashinii", "Qormaata", "Sayinsii"],
      },
    ],
    oromo: [
      {
        name: "History & Culture",
        subject: "history",
        gradeLabel: "Grade 6 Oromo",
        keywords: ["mootii", "lola", "aadaa", "seenaa"],
        amharicTerms: ["ንጉሥ", "ጦርነት", "ባህል", "ታሪክ"],
        oromoTerms: ["Mootii", "Lola", "Aadaa", "Seenaa"],
      },
    ],
    english: [
      {
        name: "Science & History",
        subject: "science",
        gradeLabel: "Grade 6 English",
        keywords: ["energy", "electricity", "machine", "experiment", "king", "battle", "tradition"],
        amharicTerms: ["ሃይል", "ኤሌክትሪክ", "ንጉሥ", "ጦርነት", "ባህል"],
        oromoTerms: ["Humna", "Ibsaa", "Mootii", "Lola", "Aadaa"],
      },
    ],
  },
  grade7: {
    amharic: [
      {
        name: "Civics & Abstract",
        subject: "abstract",
        gradeLabel: "Grade 7 Amharic",
        keywords: ["democracy", "rights", "responsibility", "equality", "freedom", "ዴሞክራሲ", "መብት", "ኃላፊነት", "እኩልነት"],
        amharicTerms: ["ዴሞክራሲ", "መብቶች", "ኃላፊነት", "እኩልነት", "ነፃነት"],
        oromoTerms: ["Dimokiraasii", "Mirga", "Itti-gaafatamummaa", "Walqixxummaa", "Bilisummaa"],
      },
    ],
    oromo: [
      {
        name: "Civics",
        subject: "abstract",
        gradeLabel: "Grade 7 Oromo",
        keywords: ["dimokiraasii", "mirga", "itti-gaafatamummaa", "walqixxummaa"],
        amharicTerms: ["ዴሞክራሲ", "መብቶች", "ኃላፊነት", "እኩልነት"],
        oromoTerms: ["Dimokiraasii", "Mirga", "Itti-gaafatamummaa", "Walqixxummaa"],
      },
    ],
    english: [
      {
        name: "Civics & Rights",
        subject: "abstract",
        gradeLabel: "Grade 7 English",
        keywords: ["democracy", "rights", "responsibility", "equality", "freedom", "justice"],
        amharicTerms: ["ዴሞክራሲ", "መብቶች", "ኃላፊነት", "እኩልነት"],
        oromoTerms: ["Dimokiraasii", "Mirga", "Itti-gaafatamummaa", "Walqixxummaa"],
      },
    ],
  },
  grade8: {
    amharic: [
      {
        name: "Economics",
        subject: "economy",
        gradeLabel: "Grade 8 Amharic",
        keywords: ["trade", "export", "import", "development", "economy", "ንግድ", "ወጪ", "ገቢ", "ልማት", "ኢኮኖሚ"],
        amharicTerms: ["ንግድ", "ወጪ ንግድ", "ገቢ ንግድ", "ልማት", "ኢኮኖሚ"],
        oromoTerms: ["Daldalaa", "Alergii", "Galii", "Guddinaa", "Diinagdee"],
      },
    ],
    oromo: [
      {
        name: "Economics",
        subject: "economy",
        gradeLabel: "Grade 8 Oromo",
        keywords: ["daldalaa", "alergii", "galii", "guddinaa", "diinagdee"],
        amharicTerms: ["ንግድ", "ወጪ ንግድ", "ገቢ ንግድ", "ልማት"],
        oromoTerms: ["Daldalaa", "Alergii", "Galii", "Guddinaa"],
      },
    ],
    english: [
      {
        name: "Economics",
        subject: "economy",
        gradeLabel: "Grade 8 English",
        keywords: ["trade", "export", "import", "development", "economy", "investment", "market"],
        amharicTerms: ["ንግድ", "ወጪ ንግድ", "ገቢ ንግድ", "ልማት"],
        oromoTerms: ["Daldalaa", "Alergii", "Galii", "Guddinaa"],
      },
    ],
  },
};

export function getCurriculumContext(
  gradeLevel: number,
  language: AppLanguage
): CurriculumTopic[] | null {
  const key = `grade${gradeLevel}`;
  const grade = CURRICULUM[key];
  if (!grade) return null;
  return grade[language] ?? grade.amharic ?? null;
}

export function findTopicForQuestion(
  questionText: string,
  gradeLevel: number,
  language: AppLanguage
): CurriculumTopic | null {
  const topics = getCurriculumContext(gradeLevel, language);
  if (!topics) return null;
  const lower = questionText.toLowerCase();
  let best: CurriculumTopic | null = null;
  let bestScore = 0;
  for (const topic of topics) {
    const score = topic.keywords.filter(
      (kw) => lower.includes(kw.toLowerCase()) || questionText.includes(kw)
    ).length;
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }
  return bestScore > 0 ? best : null;
}

export function getSubjectLabel(subject: Subject): string {
  const map: Record<string, string> = {
    general: "General",
    family: "Family",
    food: "Food",
    school: "School",
    nature: "Science",
    animals: "Animals",
    greetings: "Greetings",
    numbers: "Numbers",
    body: "Body",
    time: "Time",
    verbs: "Verbs",
    colors: "Colors",
    shapes: "Shapes",
    clothes: "Clothes",
    weather: "Weather",
    actions: "Actions",
    math: "Math",
    geography: "Geography",
    history: "History",
    science: "Science",
    abstract: "Civics",
    economy: "Economics",
    community: "Community",
  };
  return map[subject] ?? subject;
}
