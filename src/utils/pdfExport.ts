import jsPDF from 'jspdf';

interface Question {
  id: string;
  label: string;
  correctAnswer: boolean;
  recommendation: string;
}

interface Priority {
  question: Question;
  answer: 'yes' | 'no' | 'unknown';
}

interface Resource {
  id: string;
  title: string;
  theme?: {
    title: string;
  };
}

interface ExportData {
  score: number;
  level: string;
  profile: string;
  analysisText: string;
  priorities: Priority[];
  resources: Resource[];
  allQuestions: { question: Question; answer: 'yes' | 'no' | 'unknown' }[];
}

const getAnswerLabel = (answer: 'yes' | 'no' | 'unknown'): string => {
  switch (answer) {
    case 'yes':
      return 'Oui';
    case 'no':
      return 'Non';
    case 'unknown':
      return 'Je ne sais pas';
  }
};

export const generatePDF = (data: ExportData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  const lineHeight = 7;
  let yPosition = margin;

  const addNewPageIfNeeded = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > 280) {
      doc.addPage();
      yPosition = 20;
    }
  };

  const addWrappedText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0], customLineHeight: number = lineHeight, leftMargin: number = margin) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxWidth - (leftMargin - margin));
    const textHeight = lines.length * customLineHeight;
    addNewPageIfNeeded(textHeight);

    doc.text(lines, leftMargin, yPosition);
    yPosition += textHeight;
  };

  // En-tête
  addWrappedText('SecuriCoach', 24, true, [30, 64, 175], 10);

  addWrappedText('Rapport de diagnostic cybersécurité', 12, false, [100, 100, 100], 7);

  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  addWrappedText(`Date de génération : ${dateStr}`, 12, false, [100, 100, 100], 7);
  yPosition += 8;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Score
  addWrappedText('Votre score', 18, true, [0, 0, 0], 10);

  const scoreColor = data.score < 50 ? [220, 38, 38] : data.score < 70 ? [249, 115, 22] : data.score < 90 ? [37, 99, 235] : [16, 185, 129];
  addWrappedText(`${data.score}/100`, 36, true, scoreColor, 12);

  addWrappedText(data.level, 14, true, [0, 0, 0], 8);

  addWrappedText(`Profil : ${data.profile}`, 11, false, [80, 80, 80], 8);
  yPosition += 7;

  // Analyse personnalisée
  if (data.analysisText && data.analysisText.trim()) {
    addNewPageIfNeeded(30);
    addWrappedText('Analyse personnalisée', 16, true, [0, 0, 0], 10);

    addWrappedText(data.analysisText, 10, false, [60, 60, 60], 6);
    yPosition += 10;
  }

  // Priorités
  if (data.priorities.length > 0) {
    addNewPageIfNeeded(30);
    addWrappedText('Vos 3 priorités', 16, true, [0, 0, 0], 10);

    data.priorities.forEach((priority, index) => {
      addNewPageIfNeeded(20);

      const titleText = `${index + 1}. ${getAnswerLabel(priority.answer)}`;
      addWrappedText(titleText, 11, true, [37, 99, 235], 8);

      addWrappedText(priority.question.label, 10, false, [0, 0, 0], 6);
      yPosition += 3;

      const recText = `→ ${priority.question.recommendation}`;
      addWrappedText(recText, 9, false, [80, 80, 80], 5, margin + 5);
      yPosition += 8;
    });

    yPosition += 5;
  }

  // Ressources recommandées
  if (data.resources.length > 0) {
    addNewPageIfNeeded(30);
    addWrappedText('Ressources recommandées pour vous', 16, true, [0, 0, 0], 10);

    data.resources.forEach((resource, index) => {
      addNewPageIfNeeded(15);

      const resourceTitle = `${index + 1}. ${resource.title}`;
      addWrappedText(resourceTitle, 11, true, [0, 0, 0], 6);

      if (resource.theme?.title) {
        const themeText = `Thème : ${resource.theme.title}`;
        addWrappedText(themeText, 9, false, [100, 100, 100], 6, margin + 5);
        yPosition += 2;
      } else {
        yPosition += 5;
      }
    });

    yPosition += 5;
  }

  // Bilan complet
  if (data.allQuestions.length > 0) {
    addNewPageIfNeeded(30);
    addWrappedText('Bilan complet', 16, true, [0, 0, 0], 10);

    data.allQuestions.forEach((item, index) => {
      addNewPageIfNeeded(15);

      const questionText = `${index + 1}. ${item.question.label}`;
      addWrappedText(questionText, 10, true, [0, 0, 0], 5);
      yPosition += 2;

      const answerColor = item.answer === 'yes' ? [34, 197, 94] : item.answer === 'no' ? [239, 68, 68] : [249, 115, 22];
      const answerText = `Réponse : ${getAnswerLabel(item.answer)}`;
      addWrappedText(answerText, 9, false, answerColor, 5, margin + 5);
      yPosition += 3;
    });
  }

  // Page de fin
  doc.addPage();
  yPosition = margin;

  addWrappedText('Document généré par SecuriCoach — beForensic', 10, true, [100, 100, 100], 6);

  addWrappedText('securicoach.be', 10, false, [100, 100, 100], 6);
  yPosition += 2;

  const confidentialText = 'Ce rapport est confidentiel et destiné à usage personnel.';
  addWrappedText(confidentialText, 9, false, [100, 100, 100], 5);

  const fileName = `SecuriCoach-Diagnostic-${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.pdf`;
  doc.save(fileName);
};
