/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToastProvider } from './features/whatsapp-qr/components/ToastContext';
import { WhatsAppQrGenerator } from './features/whatsapp-qr/WhatsAppQrGenerator';

export default function App() {
  return (
    <ToastProvider>
      <WhatsAppQrGenerator />
    </ToastProvider>
  );
}
