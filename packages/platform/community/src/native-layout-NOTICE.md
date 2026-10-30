# Native layout source

`native-frame.tsx`, `native-document-title.tsx`, `native-columns.ts` and `native-layout.css`
derive from DeepSeek Harness `packages/client/ui-layout/src/client/` at revision
`687f282e8625c6b8d11ff58211a90524be2e4317`.

The original AppFrame, DocumentTitle, column constraints and CSS are retained.
Beelli X adapts expanded-column geometry to saved proportions, commits drag
proportions through its preferences service and retains native narrow-window
behavior. The adapter preserves the original slot registration, store and actions.
No private layout service state is accessed. It restores the original component
on disposal. The upstream checkout and installed DSH executable are unchanged.

MIT License

Copyright (c) 2026 DeepSeek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
