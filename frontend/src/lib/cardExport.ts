/**
 * Salva um SVG da tela como PNG: copia o desenho, rasteriza num canvas em `scale`× e baixa o arquivo.
 * O SVG precisa ser autossuficiente (estilos em atributos), porque a imagem não enxerga o CSS da página.
 */
export async function downloadSvgAsPng(svg: SVGSVGElement, fileName: string, scale = 4) {
  const [, , width, height] = (svg.getAttribute('viewBox') ?? '0 0 0 0').split(/\s+/).map(Number);
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute('width', String(width * scale));
  copy.setAttribute('height', String(height * scale));
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas indisponível');
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Não foi possível gerar o PNG');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
