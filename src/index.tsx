import React, { FC, HTMLAttributes, useEffect, useRef } from 'react';
import pdfjs from '@bundled-es-modules/pdfjs-dist';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  file: string;
  onLoad: () => void;
}

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
const MinimalReactPdf: FC<Props> = ({ file, onLoad, ...extraProps }) => {
  const documentRef = useRef<HTMLDivElement>(null);

  const loadDocument = async () => {
    if (documentRef.current === null) return;

    const pdfDocument = await pdfjs.getDocument(file).promise;

    for (let i = pdfDocument.numPages, j = 1; i > 0; i--, j++) {
      const page = await pdfDocument.getPage(j);
      const boxWidth = documentRef.current.clientWidth;
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

      documentRef.current.appendChild(canvas);

      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      });

      if (i === 1) onLoad && onLoad();
    }
  };

  useEffect(() => {
    loadDocument();
  }, [file, loadDocument]);

  return (
    <div
      ref={documentRef}
      style={{
        width: '100%',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: 0,
      }}
      {...extraProps}
    />
  );
};

export default MinimalReactPdf;
