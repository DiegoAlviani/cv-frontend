import jsPDF from "jspdf";

// Exportamos la función directamente
export function generatePDF(data) {
  const doc = new jsPDF();

  const language = data.language || "en"; // Aseguramos que haya un idioma por defecto

  const profileDescription = data.profile_description[language] || "";
  const experienceList = data.experience_list
    .map((exp) => `\n- ${exp.company[language]}: ${exp.role[language]} (${exp.duration[language]})\n  ${exp.description[language]}`)
    .join("\n");

  const educationList = data.education_list
    .map((edu) => `\n- ${edu.institution[language]}: ${edu.degree[language]} (${edu.duration})`)
    .join("\n");

  let content = `
    ${data.header_profile[language]}
    --------------------------
    ${profileDescription}

    ${data.header_experience[language]}
    --------------------------
    ${experienceList}

    ${data.header_education[language]}
    --------------------------
    ${educationList}
  `;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(content, 10, 10, { maxWidth: 180 });

  doc.save(`CV_Diego_Alviani_${language}.pdf`);
}
