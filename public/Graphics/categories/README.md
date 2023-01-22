Command used to generate web-optimised images:

```shell
npx @squoosh/cli --quant '{"enabled":true,"zx":0,"maxNumColors":256,"dither":1}' --oxipng '{"level":3,"interlace":false}' *.png
```