const exportPdf = () => {
  try {
    /**
     * logic
     */
    // 전체 슬라이드 객체
    const slideList = Array.from(document.querySelectorAll(".board"));

    const originWidth = slideList[0].clientWidth;
    const originHeight = slideList[0].clientHeight;

    // pdf시작
    let doc = new jsPDF("l", "px", [originHeight, originWidth]);

    const pdfData = [];
    slideList.forEach((slide, sIdx) => {
      // 1. 슬라이드 clone(복사)
      const cloneSlide = slide.cloneNode(true);

      cloneSlide.setAttribute("id", "pdf_" + sIdx); // clone슬라이드 id추가
      cloneSlide.style.position = "absolute";
      cloneSlide.style.top = "-9999px";
      cloneSlide.style.background = "#fff";
      cloneSlide.style.border = "none";
      cloneSlide.style.width = originWidth + "px";
      cloneSlide.style.height = originHeight + "px";
      cloneSlide.style.display = "block";

      // 이전슬라이드에 clone노드 붙이기
      const parentSlide = document.querySelector("#content");
      parentSlide.appendChild(cloneSlide);

      // 2. 이미지 convert
      // 이미지 converter
      // const imgList = cloneSlide.querySelectorAll("img");
      const imgList = cloneSlide.childNodes;
      const convertImg = async (list, callBack) => {
        let base64Idx = 0;
        await list.forEach((obj) => {
          if (obj.nodeName === "IMG") {
            const image = new Image();
            image.src = obj.src;
            image.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx2d = canvas.getContext("2d");
              canvas.height = image.naturalHeight;
              canvas.width = image.naturalWidth;
              ctx2d.drawImage(image, 0, 0);
              const dataUrl = canvas.toDataURL();
              obj.src = dataUrl;
              list.length === base64Idx ? callBack() : base64Idx++;
            };
          } else {
            const image = document.createElement("img");
            const className = obj.classList[0];
            const svgString = new XMLSerializer().serializeToString(obj);
            const decoded = unescape(encodeURIComponent(svgString));
            const base64 = btoa(decoded);
            const imgSource = `data:image/svg+xml;base64,${base64}`;
            image.setAttribute("src", imgSource);
            image.setAttribute("class", className);
            obj.replaceWith(image);
            list.length === base64Idx ? callBack() : base64Idx++;
          }
        });
      };

      const captureSlide = () => {
        html2canvas(cloneSlide, {
          backgroundColor: "transparent"
        })
          .then(async (canvas) => {
            const canvasUrl = canvas.toDataURL("image/png");
            pdfData.push(canvasUrl);
            if (sIdx !== 0) doc.addPage();

            if (pdfData.length === slideList.length) {
              pdfData.forEach((item, idx) => {
                doc.setPage(idx + 1);
                doc.addImage(item, "png", 0, 0);
                cloneSlide.remove();
                if (idx + 1 == pdfData.length) doc.save("convertPdf.pdf");
              });
            }
          })
          .catch((e) => console.log(e));
      };

      imgList.length > 0 ? convertImg(imgList, captureSlide()) : captureSlide();
    });
  } catch (e) {
    console.log(e);
  }
};
