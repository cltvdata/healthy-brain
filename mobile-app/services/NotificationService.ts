import { BioBannerRef } from '@/components/BioBanner';

export class BioNotificationService {
  private static bannerRef: BioBannerRef | null = null;

  static setBannerRef(ref: BioBannerRef | null) {
    this.bannerRef = ref;
  }

  /**
   * Generic trigger for the subtle banner.
   */
  static notify(message: string, type: 'info' | 'warning' | 'reward' = 'info') {
    if (this.bannerRef) {
      this.bannerRef.show(message, type);
    } else {
      console.warn("[BioNotificationService] BannerRef not set:", message);
    }
  }

  /**
   * Complex context analysis for bio-alerts.
   */
  static analyzeBioContext(hrv: number, score: number, ntk: number) {
    // Priority 1: Health Warning
    if (hrv < 40) {
      this.notify("HRV Crítico: Tu sistema está bajo estrés. ¡Inicia Sesión de Enfoque!", "warning");
      return;
    }

    // Priority 2: Gamification / NTK
    if (ntk > 100 && Math.random() > 0.8) {
      this.notify("Tienes tokens acumulados. ¿Quieres desbloquear un Bio-Hito?", "reward");
      return;
    }

    // Priority 3: Random Bio-Tip
    const tips = [
      "La luz azul reduce tu melatonina. Activa el modo Bio-Shield.",
      "Mañana será un día de alto rendimiento según tu histórico de HRV.",
      "Has mantenido una sinergia perfecta los últimos 3 días."
    ];
    if (Math.random() > 0.95) {
      this.notify(tips[Math.floor(Math.random() * tips.length)], "info");
    }
  }

  static notifyGlobalRanking(rank: number) {
    this.notify(`¡Escalaste posiciones! Ahora eres el #${rank} en la Liga Bio-Elite. 🏆`, "reward");
  }
}
