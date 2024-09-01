# ImageWizard v2

ImageWizard is a versatile image processing web application that allows users to convert, compress, pixelate, and apply various effects to images, as well as generate ASCII art and remove backgrounds. The application is built with modern web technologies and offers a user-friendly interface for a variety of image manipulation tasks.

![ImageWizard Screenshot](Animation.gif)

## Features

- **Image Conversion and Compression**: Convert and compress images to different formats such as JPG, WEBP, and PNG.
- **Pixelation**: Pixelate images with customizable pixel size, shape, and even apply rainbow effects.
- **ASCII Art**: Generate ASCII art from images, with options for both color and black-and-white outputs.
- **Image Effects**: Apply various effects such as grayscale, sepia, invert, blur, brightness, contrast, and saturation adjustments.
- **Background Removal**: Remove the background from images with improved edge detection.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Browser Image Compression
- Lucide Icons

## Prerequisites

- Node.js (v14 or later)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/imagewizard.git
   cd imagewizard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Install additional React libraries and components:
   ```bash
   npm install @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority lucide-react
   # or
   yarn add @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority lucide-react
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Upload an Image**: Start by uploading an image in PNG, JPG, or GIF format with a maximum size of 10MB.
2. **Choose an Action**: Use the tabs to select an action:
   - **Convert**: Convert and compress the image into different formats.
   - **Pixel**: Apply pixelation to the image with customizable settings.
   - **ASCII**: Convert the image into ASCII art.
   - **Effects**: Apply various effects to the image.
   - **Remove BG**: Remove the background from the image.

3. **Download the Result**: After processing, download the modified image in your desired format.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible React components.
- [Browser Image Compression](https://www.npmjs.com/package/browser-image-compression) for easy image compression.
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework.
- [Lucide Icons](https://lucide.dev/) for beautiful and customizable icons.

## Author

<p align="left">
<b>Umutcan Edizaslan:</b>
<a href="https://github.com/U-C4N" target="blank"><img align="center" src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Github-Dark.svg" alt="TutTrue" height="30" width="40" /></a>
<a href="https://x.com/UEdizaslan" target="blank"><img align="center" src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Twitter.svg" height="30" width="40" /></a>
</p>
