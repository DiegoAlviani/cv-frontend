import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generatePDF = async (data, language, returnBlob = false) => {
  return new Promise((resolve) => {
    const doc = new jsPDF({ format: "a4" });

    // 🎨 Cargar la imagen de la plantilla como fondo
    const background = new Image();
    background.src = "/base_cv2.jpg"; // 📂 Asegúrate de que la imagen está en `public/`

    background.onload = () => {
      doc.addImage(background, "PNG", 0, 0, 210, 297); // 📌 Ajustar tamaño a A4 (210x297 mm)

        //🔹 Valores por defecto (Ingles)
        let hp_x = 16 
        let hs_x = 13 
        let hl_x = 22 
        let sl_c_x = 33 
        switch (language) {
          case "es":
            hp_x = 18;
            hs_x = 5;
            hl_x = 24;
            sl_c_x = 34;
            break;
          case "it":
            hp_x = 14;
            hs_x = 8;
            hl_x = 25;
            sl_c_x = 33;
            break;
        }

      /////////////////////////// 🔹 Texto en la franja izquierda 🔹\\\\\\\\\\\\\\\\\\\\\\\\
    
      //Color de letra
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(0.1);
      doc.text("DIEGO ALVIANI", 18, 63);
      //Title profile
      doc.setFontSize(13);
      doc.setFont("times", "bold"); // 🔹 Cambia la fuente a negrita
      doc.text(data.dictionary?.header_profile, hp_x, 78);
      //Description profile
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold"); // 🔹 Cambia la fuente a negrita
      doc.text(data.dictionary?.profile_description, 34, 87, { maxWidth: 55, align: "center" });
      //Title Contact
      doc.setFont("times", "bold"); // 🔹 Cambia la fuente a negrita
      doc.setFontSize(13);
      doc.text(data.dictionary?.header_contact, 26, 167);
      //Title Skills
      doc.setFont("times", "bold"); // 🔹 Cambia la fuente a negrita
      doc.setFontSize(13);
      doc.text(data.dictionary?.header_skills, hs_x, 216);

      //Subtitle Skillss
      doc.setFontSize(11);
      doc.setFont("times", "bold"); // 🔹 Cambia la fuente a negrita
      const skillCategory = data.skills.find(skill => skill.id === 3)?.category;
      doc.text(skillCategory, sl_c_x, 223, { maxWidth: 50, align: "center" });

      //Skills Invisible
      doc.setFontSize(0.1);
      doc.setTextColor(255, 255, 255, 0);
      doc.text(data.skills.find(skills => skills.id === 3)?.skills, 10, 230, { maxWidth: 15, align: "center" });
      doc.text(data.skills.find(skills => skills.id === 1)?.skills, 50, 230, { maxWidth: 20, align: "center" });

      //Title Languages
      doc.setTextColor(255, 255, 255);
      doc.setFont("times", "bold"); // 🔹 Cambia la fuente a negrita
      doc.setFontSize(13);
      doc.text(data.dictionary?.header_languages, hl_x, 269);
      //Languages
      doc.setFont("times", "bold"); // 🔹 Cambia la fuente a negrita
      doc.setFontSize(9);
      doc.text(data.languages.find(language => language.id === 2)?.language+ ": " + data.languages.find(level => level.id === 2)?.level, 0, 276);
      doc.text(data.languages.find(language => language.id === 3)?.language+ ": " + data.languages.find(level => level.id === 3)?.level, 0, 281);
      doc.text(data.languages.find(language => language.id === 1)?.language+ ": " + data.languages.find(level => level.id === 1)?.level, 0, 286);
      


      /////////////////////////// 🔹 Texto para el area derecha 🔹\\\\\\\\\\\\\\\\\\\\\\\\

      doc.setTextColor(0, 0, 0);
      let finalY = 9;

      // 🔹 Sección de Formación Académica
      doc.setFontSize(14);
      doc.text(data.dictionary?.header_education, 71, finalY);

      autoTable(doc, {
        startY: finalY + 5,
        margin: { left: 70 },
        headStyles: {
          fillColor: [255, 255, 255], // 🔹 Fondo blanco en los encabezados
          textColor: [0, 0, 0], // 🔹 Texto negro en los encabezados
          fontSize: 11, // 🔹 Tamaño del texto en los encabezados
          fontStyle: "bold", // 🔹 Texto en negrita
        },
        columnStyles: {
          0: { cellWidth: 55 }, // 🔹 Columna "Institución" → 50 mm
          1: { cellWidth: 60 }, // 🔹 Columna "Título" → 40 mm
        },
        styles: {
          fontSize: 9,
          //minCellHeight: 5, // 🔹 Establece la altura mínima de cada celda (en mm)
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 0) { // 🔹 Solo afecta la primera columna en el cuerpo
            data.cell.styles.fontStyle = "bold"; // 🔹 Aplica negrita
          }
        },
        alternateRowStyles: { fillColor: [255, 255, 255] }, // 🔹 Todas las filas serán blancas
        tableWidth: "wrap", // 🔹 Ajusta la tabla automáticamente al contenido
        head: [[data.dictionary?.institution, data.dictionary?.degree]],
        body: data.education?.map(edu => [
        edu.institution,
        edu.degree,

        ]) ,
      });

      finalY = doc.lastAutoTable.finalY + 10;

     // 🔹 Sección de Experiencia Laboral
      doc.setFontSize(14);
      doc.text(data.dictionary?.header_experience, 70, finalY);

      autoTable(doc, {
        startY: finalY + 5,
        margin: { left: 70 },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontSize: 11,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 38 },
          1: { cellWidth: 37 },
          2: { cellWidth: 65 },
        },
        styles: {
          fontSize: 9,
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            data.cell.styles.fontStyle = "bold";
          }
        },
        tableWidth: "wrap",
        head: [[data.dictionary?.company, data.dictionary?.role, data.dictionary?.description]],
        body: [...data.experience]
          .sort((a, b) => b.id - a.id) // ✅ Ordena de mayor a menor ID
          .map(exp => [
            exp.company + "\n\n" + exp.duration.replace("- ", "\n"),
            exp.role,
            exp.description,
          ])
      });
      finalY = doc.lastAutoTable.finalY + 15;

      // 🔹 Sección de Proyectos
      doc.setFontSize(14);
      doc.text(data.dictionary?.header_projects, 70, finalY);

      autoTable(doc, {
        startY: finalY + 5,
        margin: { left: 70 },
        headStyles: {
          fillColor: [255, 255, 255], // 🔹 Fondo blanco en los encabezados
          textColor: [0, 0, 0], // 🔹 Texto negro en los encabezados
          fontSize: 11, // 🔹 Tamaño del texto en los encabezados
          fontStyle: "bold", // 🔹 Texto en negrita
        },
        columnStyles: {
          0: { cellWidth: 35 }, // 🔹 Columna "Project" → 50 mm
          1: { cellWidth: 65 }, // 🔹 Columna "Description" → 40 mm
          2: { cellWidth: 40 }, // 🔹 Columna "Technologies" → 40 mm
        },
        styles: {
          fontSize: 9,
          //minCellHeight: 5, // 🔹 Establece la altura mínima de cada celda (en mm)
        },
        tableWidth: "wrap", // 🔹 Ajusta la tabla automáticamente al contenido
        head: [[data.dictionary?.project_name, data.dictionary?.project_description, data.dictionary?.technologies]],
        body: data.projects?.map(proj => [
        proj.name,
        proj.description,
        proj.technologies,
        ]),
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 0) { // 🔹 Solo afecta la primera columna en el cuerpo
            data.cell.styles.fontStyle = "bold"; // 🔹 Aplica negrita
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 0) { // 🔹 Ahora es la segunda columna (proj.name)
            const projectT = data.row.raw[2]; // 🔹 `id` está en la primera posición de `raw`
        
            if (projectT.includes("Arduino")) { // 🔹 Si el ID es 3, agrega el enlace
              doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: "https://youtu.be/b1gvmyRETFE" });
            }
          }
        },
        
      });

      // 🔹 Hipervínculos
      //doc.rect(16, 172, 38, 6); // 🔹 Dibuja un rectángulo alrededor del área clickeable
      doc.link(16, 172, 38, 6, { url: "tel:+393387452613" });

      //doc.rect(9, 182, 50, 5); // 🔹 Dibuja un rectángulo alrededor del área clickeable
      doc.link(9, 182, 50, 5, { url: "mailto:alvianidiego@gmail.com" });

      //doc.rect(4, 192, 60, 5); // 🔹 Dibuja un rectángulo alrededor del área clickeable
      doc.link(4, 192, 60, 5, { url: "https://linkedin.com/in/diego-alviani" });

      //doc.rect(4, 202, 60, 5); // 🔹 Dibuja un rectángulo alrededor del área clickeable
      doc.link(4, 202, 60, 5, { url: "https://www.youtube.com/@anonneron" });

      // 🔹 Autorizzo il trattamento dei dati in conformità a quanto previsto dal dl 196/03 
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text("Autorizzo il trattamento dei dati in conformità a quanto previsto dal dl 196/03", 108, 294);

      // ✅ **Devolver el PDF como Blob**
      if (returnBlob) {
        resolve(doc.output("blob"));
      } else {
        doc.save(`CV_Diego_Alviani_${language}.pdf`);
        resolve(null);
      }
    };
  });
};

export default generatePDF;
