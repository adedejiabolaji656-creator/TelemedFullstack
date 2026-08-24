import nodeProcess from 'process/';
import { Buffer } from 'buffer/';

// Browser polyfills for Node builtins used by simple-peer (WebRTC).
// Imported as the very first module in main.jsx so it runs before
// anything that evaluates simple-peer.
if (typeof window !== 'undefined') {
  if (!window.process) window.process = nodeProcess;
  if (!window.Buffer) window.Buffer = Buffer;
}
