import postcssPresetEnv from 'postcss-preset-env';
import tailwindcssNesting from 'tailwindcss/nesting';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
import postcssLogical from 'postcss-logical';

export default {
  plugins: [
    postcssImport(),
    tailwindcssNesting(),
    tailwindcss(), // ✅ Correct usage
    autoprefixer(),
    postcssPresetEnv({
      features: {
        'nesting-rules': false,
        'is-pseudo-class': false,
      },
    }),
    postcssLogical({
      preserve: true,
    }),
  ],
};
