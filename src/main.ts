import { ticketProofRequest } from '@parcnet-js/ticket-spec';
import './style.css'
import { connect, ParcnetAPI, Zapp } from '@parcnet-js/app-connector'
import * as p from '@parcnet-js/podspec'

const myApp: Zapp = {
  name: 'Devcon Ticket Authentication',
  permissions: []
}

let z: ParcnetAPI | undefined = undefined;

async function main(): Promise<void> {
  z = await connect(myApp, document.querySelector<HTMLDivElement>('#connector')!, "https://staging.zupass.org");
  document.querySelector<HTMLButtonElement>('#authenticate')!.addEventListener('click', async () => {
    const req = ticketProofRequest({
      classificationTuples: [{
        signerPublicKey: "HZ3Zed6HmpTPJd9uMcEHnfVCG9Gaio3Jj/Ru0Fu3NhA",
        eventId: "5074edf5-f079-4099-b036-22223c0c6995"
      }],
      fieldsToReveal: { 
        attendeeEmail: true,
        attendeeName: true,
        eventId: true,
      }
    });
    const proof = await z?.gpc.prove(req.schema);
    if (proof?.success) {
      document.querySelector<HTMLDivElement>('#details')!.innerHTML = `
        <p>Email address: ${proof.revealedClaims.pods.ticket.entries?.attendeeEmail.value}</p>
        <p>Name: ${proof.revealedClaims.pods.ticket.entries?.attendeeName.value}</p>
      `
    } 
  })
}


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Devcon Ticket Authentication</h1>
    <div class="card">
      <button id="authenticate" type="button">Authenticate</button>
    </div>
    <div class="card">
      <div id="details"></div>
    </div>
    <div id="connector"></div>
  </div>
`

main().catch(console.error);
