namespace Energy_Bridge.Models.Entities
{
    public class Stock
    {
        public int id { get; set; }
        public string connections { get; set; }
        public string link_name { get; set; }

        public string type { get; set; }
        public string brand { get; set; }
        public string sn { get; set; }

        public string supplier { get; set; }
        public int price { get; set; }
        public int antenna_size { get; set; }
        public string status { get; set; }
        public DateTime purchase_date { get; set; }
        public int? created_by { get; set; }
        public DateTime created_on { get; set; }


    }
}
