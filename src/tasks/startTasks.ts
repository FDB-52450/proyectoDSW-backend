import { startPedidosScanTask } from "./cancelOldPedidos.js";
import { startClientesScanTask } from "./handleClienteBans.js";

export function startTasks() {
    startPedidosScanTask()
    startClientesScanTask()
}