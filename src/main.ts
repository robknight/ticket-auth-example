import { ticketProofRequest } from "@parcnet-js/ticket-spec";
import "./style.css";
import { connect, ParcnetAPI, Zapp } from "@parcnet-js/app-connector";

const myApp: Zapp = {
  name: "Devcon Ticket Authentication",
  permissions: {
    REQUEST_PROOF: { collections: ["Tickets"] },
  },
};

let z: ParcnetAPI | undefined = undefined;

async function main(): Promise<void> {
  console.log("connecting");
  z = await connect(
    myApp,
    document.querySelector<HTMLDivElement>("#connector")!,
    "https://zupass.org"
  );
  document
    .querySelector<HTMLButtonElement>("#authenticate")!
    .removeAttribute("disabled");
  document
    .querySelector<HTMLButtonElement>("#authenticate")!
    .addEventListener("click", async () => {
      const req = ticketProofRequest({
        classificationTuples: [
          {
            signerPublicKey: "YwahfUdUYehkGMaWh0+q3F8itx2h8mybjPmt8CmTJSs",
            eventId: "5074edf5-f079-4099-b036-22223c0c6995",
          },
        ],
        fieldsToReveal: {
          attendeeEmail: true,
          attendeeName: true,
          eventId: true,
        },
      });
      document
        .querySelector<HTMLButtonElement>("#authenticate")!
        .setAttribute("disabled", "true");
      try {
        const proof = await z?.gpc.prove({ request: req.schema, collectionIds: ["Tickets"] });
        console.log(proof);
        document
          .querySelector<HTMLButtonElement>("#authenticate")!
          .setAttribute("disabled", "true");
        if (proof?.success) {
          document.querySelector<HTMLDivElement>("#details")!.innerHTML = `
        <p>Email address: ${proof.revealedClaims.pods.ticket.entries?.attendeeEmail.value}</p>
        <p>Name: ${proof.revealedClaims.pods.ticket.entries?.attendeeName.value}</p>
      `;
        } else {
          if (proof?.error) {
            document.querySelector<HTMLDivElement>("#details")!.innerHTML = `
          <p>Error: ${proof.error}</p>
        `;
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        document
          .querySelector<HTMLButtonElement>("#authenticate")!
          .removeAttribute("disabled");
      }
    });
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Devcon Ticket Authentication</h1>
    <div class="card">
      <button id="authenticate" type="button" disabled>Authenticate</button>
    </div>
    <div class="card">
      <div id="details"></div>
    </div>
    <div id="connector"></div>
  </div>
`;

main().catch(console.error);
