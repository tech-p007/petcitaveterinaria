import { Router, type IRouter } from "express";
import { processIncomingWhatsapp } from "../services/whatsappBooking";
import { twimlMessage } from "../services/twilio";

const router: IRouter = Router();

router.post("/webhooks/twilio/whatsapp", async (req, res) => {
  try {
    const from = String(req.body?.From ?? "");
    const body = String(req.body?.Body ?? "");
    // Captura el nombre enviado por WhatsApp/Twilio, o usa "Cliente" por defecto si no viene ninguno
    const profileName = String(req.body?.ProfileName ?? "Cliente");

    if (!from) {
      res
        .type("text/xml")
        .send(
          twimlMessage("No pudimos identificar tu número. Intenta nuevamente."),
        );
      return;
    }

    // Enviamos también el nombre capturado al servicio de procesamiento
    const result = await processIncomingWhatsapp({
      phone: from,
      text: body,
      name: profileName,
    });

    res.type("text/xml").send(twimlMessage(result.reply));
  } catch (error) {
    console.error("Twilio webhook failed", error);
    res
      .type("text/xml")
      .send(
        twimlMessage(
          "Tuvimos un inconveniente. El equipo de la clínica te responderá pronto.",
        ),
      );
  }
});

export default router;
