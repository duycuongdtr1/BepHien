
export interface FoodItem {
  id: string;
  name: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  items: string[];
}

export const FOOD_CATEGORIES: Category[] = [
  {
    id: "thit",
    name: "Thịt",
    items: [
      "Ba chỉ heo", "Sườn non", "Nạc vai", "Nạc thăn", "Chân giò", "Cốt lết",
      "Thăn bò", "Bắp bò", "Ba chỉ bò", "Nạm bò", "Gầu bò", "Sườn bò",
      "Gà"
    ]
  },
  {
    id: "ca",
    name: "Cá",
    items: ["Cá lóc", "Cá nục", "Cá hú", "Cá dứa"]
  },
  {
    id: "hai-san",
    name: "Hải sản",
    items: ["Tôm sú", "Tôm thẻ", "Tôm càng xanh", "Tôm hùm", "Tôm đất", "Hến", "Cua"]
  },
  {
    id: "noi-tang",
    name: "Nội tạng / phần phụ",
    items: ["Lòng heo"]
  },
  {
    id: "trung",
    name: "Trứng",
    items: ["Trứng gà / trứng vịt"]
  },
  {
    id: "dau",
    name: "Đậu / chế phẩm đậu",
    items: ["Đậu hũ"]
  },
  {
    id: "rau-la",
    name: "Rau lá",
    items: [
      "Rau dền", "Rau muống", "Rau lang", "Rau đay", "Mồng tơi", 
      "Cải xanh", "Cải ngọt", "Xà lách", "Rau thơm", "Ngò", 
      "Hành lá", "Lá giang", "Rong biển"
    ]
  },
  {
    id: "rau-cu-qua",
    name: "Rau củ quả dùng nấu ăn",
    items: [
      "Bí đỏ", "Mướp", "Khổ qua", "Cà tím", "Cà chua", "Dưa leo", 
      "Đậu rồng", "Đậu ve", "Giá đỗ", "Hẹ", "Măng", "Khoai mỡ", 
      "Thơm / dứa", "Xoài", "Ớt", "Hành tím", "Tỏi", "Sả", "Me", 
      "Cải chua", "Cà pháo"
    ]
  },
  {
    id: "trai-cay",
    name: "Trái cây",
    items: ["Cam", "Quýt / quết", "Dưa hấu", "Chuối", "Táo", "Ổi"]
  },
  {
    id: "tinh-bot",
    name: "Tinh bột",
    items: ["Gạo"]
  },
  {
    id: "gia-vi",
    name: "Gia vị / nước chấm",
    items: [
      "Nước mắm", "Mắm ruốc", "Mắm tôm", "Đường", "Muối", 
      "Tiêu", "Dầu ăn", "Giấm", "Nước màu"
    ]
  },
  {
    id: "phu-kien",
    name: "Nhóm nguyên liệu phụ",
    items: ["Chanh", "Tỏi ớt", "Hành phi hoặc hành băm"]
  }
];
