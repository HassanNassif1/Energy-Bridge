using Microsoft.AspNetCore.SignalR;

namespace Energy_Bridge.Hubs
{
    public class ChatHub : Hub
    {
        // Send a message to all clients
        public async Task SendMessage(string sender, string receiver, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", sender, receiver, message);
        }
    }
}
