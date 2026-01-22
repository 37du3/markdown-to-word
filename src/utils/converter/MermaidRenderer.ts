import mermaid from 'mermaid';

export class MermaidRenderer {
    private static initialized = false;

    private static init() {
        if (!this.initialized) {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose', // allowing scripts in SVG if needed, but mostly for style
            });
            this.initialized = true;
        }
    }

    /**
     * Renders a mermaid string to a PNG ArrayBuffer
     */
    static async renderToBuffer(code: string): Promise<{ buffer: ArrayBuffer; width: number; height: number }> {
        this.init();

        try {
            // 1. Generate unique ID
            const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            // 2. Render SVG
            const { svg } = await mermaid.render(id, code);

            // 3. Convert SVG string to PNG Buffer
            return await this.svgToPngBuffer(svg);
        } catch (error) {
            console.error('Mermaid render error:', error);
            throw error;
        }
    }

    private static svgToPngBuffer(svgString: string): Promise<{ buffer: ArrayBuffer; width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // Add white background style to SVG if missing, otherwise transparent PNG might look bad in Word
            // But wrapping it in white canvas handles that.

            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Scale up for better resolution in Word
                const scale = 2;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(url);
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // Fill white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    if (!blob) {
                        reject(new Error('Canvas to Blob failed'));
                        return;
                    }
                    blob.arrayBuffer()
                        .then(buffer => resolve({
                            buffer,
                            width: img.width,
                            height: img.height
                        }))
                        .catch(reject);
                }, 'image/png');
            };

            img.onerror = (_e) => {
                URL.revokeObjectURL(url);
                reject(new Error('Image failed to load SVG'));
            };

            img.src = url;
        });
    }
}
