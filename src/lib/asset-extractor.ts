import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - get-image-colors doesn't have type definitions
import getColors from 'get-image-colors';

export interface ExtractedAssets {
    logo?: {
        url: string;
        format: string;
        localPath: string;
    };
    product_images: Array<{
        url: string;
        alt?: string;
        localPath: string;
    }>;
    brand_colors: {
        primary: string;
        secondary: string;
    };
    font_family: string;
    extracted_at: string;
}

/**
 * Extracts brand assets from a website using Puppeteer
 */
export async function extractBrandAssets(url: string, outputDir: string): Promise<ExtractedAssets> {
    let browser: Browser | null = null;
    const extractedAssets: ExtractedAssets = {
        product_images: [],
        brand_colors: { primary: '#000000', secondary: '#666666' },
        font_family: 'Arial, sans-serif',
        extracted_at: new Date().toISOString(),
    };

    try {
        // Ensure output directory exists (must be inside public for Next.js to serve)
        // The outputDir parameter should be just the jobId, we construct the full path
        const actualOutputDir = path.join(process.cwd(), 'public', 'extracted_assets', outputDir);
        if (!fs.existsSync(actualOutputDir)) {
            fs.mkdirSync(actualOutputDir, { recursive: true });
        }

        // Launch browser
        // Use system Chrome if available (for Docker deployments)
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
        browser = await puppeteer.launch({
            headless: true,
            executablePath,
            timeout: 60000, // Increase timeout to 60 seconds
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();
        
        // Set viewport for consistent rendering
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Navigate to URL with timeout
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Extract logo
        const logo = await extractLogo(page, actualOutputDir);
        if (logo) {
            extractedAssets.logo = logo;
        }

        // Extract product images (top 3)
        const productImages = await extractProductImages(page, actualOutputDir, 3);
        extractedAssets.product_images = productImages;

        // Extract brand colors from hero section or main content
        const colors = await extractBrandColors(page, actualOutputDir);
        if (colors) {
            extractedAssets.brand_colors = colors;
        }

        // Extract font family
        const fontFamily = await extractFontFamily(page);
        if (fontFamily) {
            extractedAssets.font_family = fontFamily;
        }

        return extractedAssets;
    } catch (error) {
        console.error('Error extracting assets:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Extracts logo from the page
 */
async function extractLogo(page: Page, outputDir: string): Promise<ExtractedAssets['logo'] | null> {
    try {
        // Try to find logo in various ways
        const logoSelectors = [
            'img[alt*="logo" i]',
            'img[alt*="brand" i]',
            'a[href="/"] img',
            'header img',
            'nav img',
            'svg[class*="logo" i]',
            'svg[id*="logo" i]',
        ];

        for (const selector of logoSelectors) {
            const element = await page.$(selector);
            if (element) {
                if (selector.startsWith('svg')) {
                    // Handle SVG logos
                    const svgContent = await page.evaluate((el) => el.outerHTML, element);
                    const svgPath = path.join(outputDir, 'logo.svg');
                    fs.writeFileSync(svgPath, svgContent);
                    const relativePath = path.relative(path.join(process.cwd(), 'public'), svgPath);
                    return {
                        url: `/${relativePath.replace(/\\/g, '/')}`,
                        format: 'svg',
                        localPath: svgPath,
                    };
                } else {
                    // Handle image logos
                    const imgSrc = await page.evaluate((el) => (el as HTMLImageElement).src, element);
                    if (imgSrc) {
                        const logoUrl = await resolveUrl(imgSrc, page.url());
                        const logoPath = await downloadImage(logoUrl, outputDir, 'logo');
                        if (logoPath) {
                            const format = path.extname(logoPath).slice(1) || 'png';
                            const relativePath = path.relative(path.join(process.cwd(), 'public'), logoPath);
                            return {
                                url: `/${relativePath.replace(/\\/g, '/')}`,
                                format,
                                localPath: logoPath,
                            };
                        }
                    }
                }
            }
        }

        // Fallback: try favicon
        const faviconUrl = await page.evaluate(() => {
            const link = document.querySelector('link[rel*="icon" i]') as HTMLLinkElement;
            return link?.href || null;
        });

        if (faviconUrl) {
            const resolvedUrl = await resolveUrl(faviconUrl, page.url());
            const faviconPath = await downloadImage(resolvedUrl, outputDir, 'logo');
            if (faviconPath) {
                const format = path.extname(faviconPath).slice(1) || 'ico';
                const relativePath = path.relative(path.join(process.cwd(), 'public'), faviconPath);
                return {
                    url: `/${relativePath.replace(/\\/g, '/')}`,
                    format,
                    localPath: faviconPath,
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error extracting logo:', error);
        return null;
    }
}

/**
 * Extracts product/brand images from the page
 */
async function extractProductImages(page: Page, outputDir: string, maxImages: number): Promise<ExtractedAssets['product_images']> {
    try {
        const images = await page.evaluate((max) => {
            const allImages = Array.from(document.querySelectorAll('img'));
            
            // Filter out UI elements (small images, icons, etc.)
            const productImages = allImages
                .filter((img) => {
                    const width = img.naturalWidth || img.width || 0;
                    const height = img.naturalHeight || img.height || 0;
                    // Filter for images that are likely products/content (larger than 200x200)
                    return width > 200 && height > 200;
                })
                .filter((img) => {
                    const alt = img.alt?.toLowerCase() || '';
                    // Exclude common UI elements
                    const uiKeywords = ['icon', 'logo', 'avatar', 'button', 'badge', 'decorative'];
                    return !uiKeywords.some(keyword => alt.includes(keyword));
                })
                .map((img) => ({
                    src: img.src,
                    alt: img.alt || '',
                    width: img.naturalWidth || img.width || 0,
                    height: img.naturalHeight || img.height || 0,
                }))
                .sort((a, b) => (b.width * b.height) - (a.width * a.height)) // Sort by size
                .slice(0, max);

            return productImages;
        }, maxImages);

        const extractedImages: ExtractedAssets['product_images'] = [];

        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            try {
                const resolvedUrl = await resolveUrl(img.src, page.url());
                const imgPath = await downloadImage(resolvedUrl, outputDir, `product_${i + 1}`);
                if (imgPath) {
                    const relativePath = path.relative(path.join(process.cwd(), 'public'), imgPath);
                    extractedImages.push({
                        url: `/${relativePath.replace(/\\/g, '/')}`,
                        alt: img.alt,
                        localPath: imgPath,
                    });
                }
            } catch (error) {
                console.error(`Error downloading image ${i + 1}:`, error);
                // Continue with next image
            }
        }

        return extractedImages;
    } catch (error) {
        console.error('Error extracting product images:', error);
        return [];
    }
}

/**
 * Extracts brand colors from the hero section or main content
 */
async function extractBrandColors(page: Page, outputDir: string): Promise<ExtractedAssets['brand_colors'] | null> {
    try {
        // Take a screenshot of the hero section or main content area
        const heroElement = await page.$('main, header, section, .hero, [class*="hero"]');
        
        if (heroElement) {
            const screenshotPath = path.join(outputDir, 'hero_screenshot.png');
            await heroElement.screenshot({ path: screenshotPath });
            
            // Extract colors from screenshot
            const colors = await getColors(screenshotPath);
            
            if (colors && colors.length >= 2) {
                return {
                    primary: colors[0].hex(),
                    secondary: colors[1].hex(),
                };
            } else if (colors && colors.length === 1) {
                return {
                    primary: colors[0].hex(),
                    secondary: colors[0].hex(),
                };
            }
        }

        // Fallback: extract computed styles from main headings
        const computedColors = await page.evaluate(() => {
            const headings = document.querySelectorAll('h1, h2, h3');
            const colors = new Set<string>();
            
            for (const heading of Array.from(headings).slice(0, 5)) {
                const style = window.getComputedStyle(heading);
                const color = style.color;
                if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
                    colors.add(color);
                }
            }
            
            return Array.from(colors);
        });

        if (computedColors.length >= 2) {
            // Convert RGB/RGBA to hex (simplified)
            return {
                primary: rgbToHex(computedColors[0]),
                secondary: rgbToHex(computedColors[1]),
            };
        }

        return null;
    } catch (error) {
        console.error('Error extracting brand colors:', error);
        return null;
    }
}

/**
 * Extracts font family from main content
 */
async function extractFontFamily(page: Page): Promise<string | null> {
    try {
        const fontFamily = await page.evaluate(() => {
            const mainContent = document.querySelector('main, article, .content, body');
            if (mainContent) {
                const style = window.getComputedStyle(mainContent);
                return style.fontFamily;
            }
            return null;
        });

        if (fontFamily) {
            // Extract first font family (before comma)
            return fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        }

        return null;
    } catch (error) {
        console.error('Error extracting font family:', error);
        return null;
    }
}

/**
 * Resolves a relative or absolute URL to a full URL
 */
async function resolveUrl(url: string, baseUrl: string): Promise<string> {
    try {
        return new URL(url, baseUrl).href;
    } catch {
        return url;
    }
}

/**
 * Downloads an image from a URL to the output directory
 */
function downloadImage(url: string, outputDir: string, baseName: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
        try {
            const parsedUrl = new URL(url);
            const ext = path.extname(parsedUrl.pathname) || '.png';
            const fileName = `${baseName}${ext}`;
            const filePath = path.join(outputDir, fileName);

            const client = parsedUrl.protocol === 'https:' ? https : http;

            const file = fs.createWriteStream(filePath);
            
            client.get(url, (response) => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    // Handle redirects
                    if (response.headers.location) {
                        return downloadImage(response.headers.location, outputDir, baseName)
                            .then(resolve)
                            .catch(reject);
                    }
                }

                if (response.statusCode !== 200) {
                    file.close();
                    fs.unlinkSync(filePath);
                    return resolve(null);
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve(filePath);
                });
            }).on('error', () => {
                file.close();
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                resolve(null); // Don't reject, just return null for failed downloads
            });
        } catch {
            resolve(null);
        }
    });
}

/**
 * Converts RGB/RGBA string to hex color
 */
function rgbToHex(rgb: string): string {
    try {
        // Handle rgb/rgba format
        const match = rgb.match(/\d+/g);
        if (match && match.length >= 3) {
            const r = parseInt(match[0]);
            const g = parseInt(match[1]);
            const b = parseInt(match[2]);
            return `#${[r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('')}`;
        }
    } catch {
        // If conversion fails, return a default color
    }
    return '#000000';
}


