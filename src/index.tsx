import React, { HTMLAttributes } from 'react';
import pdfjs from '@bundled-es-modules/pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export interface Props extends HTMLAttributes<HTMLDivElement> {
  file: string;
  onLoad: () => void;
}

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
export default class MinimalReactPdf extends React.Component<Props> {
  documentRef = React.createRef<HTMLDivElement>()

  async loadDocument() {
    if (this.documentRef.current === null) return;

    const pdfDocument = await pdfjs.getDocument(this.props.file).promise;

    for (let i = pdfDocument.numPages, j = 1; i > 0; i--, j++) {
      const page = await pdfDocument.getPage(j);
      const boxWidth = this.documentRef.current.clientWidth;
      const pageWidth = page.getViewport({
        scale: 1,
      }).width;
      const scale = boxWidth / pageWidth;
      const scaledViewport = page.getViewport({
        scale,
      });

      const canvas = document.createElement('canvas');
      canvas.id = `page-${j}`;
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      this.documentRef.current.appendChild(canvas);

      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      });

      if (i === 1) this.props.onLoad && this.props.onLoad();
    }
  }

  componentDidMount() {
    this.loadDocument()
  }

  componentDidUpdate() {
    this.loadDocument()
  }

  render() {
    return (
      <div
        ref={this.documentRef}
        style={{
          width: '100%',
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
          padding: 0,
        }}
        {...this.props}
      />
    );
  }
}
