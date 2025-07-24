const url = 'sample-pdf/sample.pdf'; // Replace with actual file path

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    scale = 1.2,
    canvas = document.getElementById('pdf-render'),
    ctx = canvas.getContext('2d');

const renderPage = num => {
  pageIsRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    document.getElementById('page-info').textContent = `Page ${num} / ${pdfDoc.numPages}`;
  });
};

const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

const prevPage = () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
};

const nextPage = () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
};

const zoomIn = () => {
  scale += 0.2;
  queueRenderPage(pageNum);
};

const zoomOut = () => {
  if (scale > 0.4) {
    scale -= 0.2;
    queueRenderPage(pageNum);
  }
};

pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;
  document.getElementById('doc-title').textContent = url.split('/').pop();
  renderPage(pageNum);
});
