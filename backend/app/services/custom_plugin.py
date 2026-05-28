from hedera_agent_kit import Tool, Plugin
from hiero_sdk_python import Client, TransferTransaction, Hbar, AccountId, TopicMessageSubmitTransaction, TopicId
from hedera_agent_kit.shared.configuration import Context
from hedera_agent_kit.shared.models import ToolResponse
from pydantic import BaseModel, Field

class SettleInvoiceParams(BaseModel):
    recipient_id: str = Field(description="The Hedera account ID of the recipient/merchant (e.g. 0.0.12345)")
    amount_hbar: float = Field(description="The invoice amount in HBAR to be transferred")
    invoice_ref: str = Field(description="A unique alphanumeric business reference or invoice number")

class SettleInvoiceTool(Tool):
    method = "settle_commercial_invoice"
    name = "Settle Commercial Invoice"
    description = (
        "Settles a commercial invoice by executing an on-chain HBAR transfer to the merchant "
        "and returning the transaction receipt details including the transaction ID and status."
    )
    parameters = SettleInvoiceParams

    async def execute(self, client: Client, context: Context, params: SettleInvoiceParams) -> ToolResponse:
        try:
            # Construct a transfer transaction
            transfer = (
                TransferTransaction()
                .add_hbar_transfer(client.operator.account_id, Hbar.from_hbars(-params.amount_hbar))
                .add_hbar_transfer(AccountId.from_string(params.recipient_id), Hbar.from_hbars(params.amount_hbar))
            )
            receipt = transfer.execute(client)
            
            # Format successful tool response
            raw_data = {
                "status": "SUCCESS",
                "transaction_id": str(receipt.transaction_id),
                "recipient_id": params.recipient_id,
                "amount_hbar": params.amount_hbar,
                "invoice_ref": params.invoice_ref,
                "consensus_timestamp": str(receipt.consensus_timestamp) if hasattr(receipt, 'consensus_timestamp') else "N/A"
            }
            
            return ToolResponse(
                human_message=(
                    f"Successfully settled commercial invoice '{params.invoice_ref}'. "
                    f"Transferred {params.amount_hbar} HBAR to {params.recipient_id}. "
                    f"Transaction ID: {receipt.transaction_id}."
                ),
                extra=raw_data
            )
        except Exception as e:
            return ToolResponse(
                human_message=f"Failed to settle commercial invoice '{params.invoice_ref}': {str(e)}",
                error=str(e),
                extra={"status": "FAILED"}
            )

class SubmitHCSParams(BaseModel):
    topic_id: str = Field(description="The Hedera HCS Topic ID to submit to")
    message: str = Field(description="The audit receipt or message to log on HCS")

class SubmitHCSReceiptTool(Tool):
    method = "submit_hcs_receipt"
    name = "Submit HCS Receipt"
    description = (
        "Submits an immutable audit trail receipt to the Hedera Consensus Service (HCS)."
    )
    parameters = SubmitHCSParams

    async def execute(self, client: Client, context: Context, params: SubmitHCSParams) -> ToolResponse:
        try:
            submit_tx = TopicMessageSubmitTransaction().set_topic_id(TopicId.from_string(params.topic_id)).set_message(params.message)
            receipt = submit_tx.execute(client)

            
            raw_data = {
                "status": "SUCCESS",
                "hcs_sequence_number": str(receipt.topic_sequence_number),
                "topic_id": params.topic_id
            }
            
            return ToolResponse(
                human_message=(
                    f"Successfully published receipt to HCS topic {params.topic_id}. "
                    f"Sequence Number: {receipt.topic_sequence_number}."
                ),
                extra=raw_data
            )
        except Exception as e:
            return ToolResponse(
                human_message=f"Failed to publish to HCS: {str(e)}",
                error=str(e),
                extra={"status": "FAILED"}
            )

def get_custom_plugin(context: Context) -> Plugin:
    return Plugin(
        name="enterprise_workflow_plugin",
        tools=lambda ctx: [SettleInvoiceTool(), SubmitHCSReceiptTool()],
        version="1.0.0",
        description="Enterprise workflow plugin containing commercial settlement and business invoicing tools."
    )
