/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  FileDown, 
  ChevronRight, 
  ChevronDown, 
  ShoppingCart, 
  Search,
  CheckCircle2,
  AlertCircle,
  Send,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FOOD_CATEGORIES, Category } from './constants';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface RecordedItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  total: number;
}

export default function App() {
  const [recordedItems, setRecordedItems] = useState<RecordedItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([FOOD_CATEGORIES[0].id]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const addItem = (name: string, category: string) => {
    const newItem: RecordedItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      price: 0,
      quantity: 1,
      unit: 'kg',
      total: 0
    };
    setRecordedItems([...recordedItems, newItem]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const updateItem = (id: string, field: keyof RecordedItem, value: any) => {
    setRecordedItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'price' || field === 'quantity') {
          updatedItem.total = updatedItem.price * updatedItem.quantity;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setRecordedItems(prev => prev.filter(item => item.id !== id));
  };

  const grandTotal = useMemo(() => {
    return recordedItems.reduce((sum, item) => sum + item.total, 0);
  }, [recordedItems]);

  const exportPDF = async () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: 'gia-thuc-pham.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF generation failed', error);
      alert('Có lỗi khi xuất file PDF. Vui lòng thử lại.');
    }
  };

  const sendEmail = async () => {
    if (recordedItems.length === 0) return;

    const element = document.getElementById('pdf-content');
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `gia-thuc-pham-${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      const pdfFile = new File([pdfBlob], `gia-thuc-pham-${new Date().getTime()}.pdf`, { type: 'application/pdf' });

      // Try Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: 'Danh sách giá thực phẩm',
            text: `Gửi Cường danh sách giá thực phẩm ngày ${new Date().toLocaleDateString('vi-VN')}`,
          });
          return;
        } catch (error) {
          console.log('Share failed', error);
        }
      }

      // Fallback: Download + Mailto
      await html2pdf().set(opt).from(element).save();
      
      const itemsList = recordedItems.map(item => 
        `- ${item.name}: ${item.quantity} ${item.unit} x ${new Intl.NumberFormat('vi-VN').format(item.price)} = ${new Intl.NumberFormat('vi-VN').format(item.total)}`
      ).join('\n');
      
      const body = `Chào Cường,\n\nTôi gửi danh sách giá thực phẩm ngày ${new Date().toLocaleDateString('vi-VN')}.\n(Vui lòng đính kèm file PDF đã tự động tải về vào email này)\n\nChi tiết:\n${itemsList}\n\nTổng cộng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}`;
      
      const mailtoLink = `mailto:duycuongtd1@gmail.com?subject=Danh sách giá thực phẩm - ${new Date().toLocaleDateString('vi-VN')}&body=${encodeURIComponent(body)}`;
      
      window.location.href = mailtoLink;
      
      alert("Đã tự động tải file PDF. Vui lòng đính kèm file này vào email vừa mở để gửi cho Cường.");
    } catch (error) {
      console.error('Email sending failed', error);
      alert('Có lỗi khi chuẩn bị file gửi email. Vui lòng thử lại.');
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return FOOD_CATEGORIES;
    return FOOD_CATEGORIES.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <ShoppingCart size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-900">Quản Lý Giá Thực Phẩm</h1>
          </div>
          
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm thực phẩm..." 
                className="w-full pl-10 pr-4 py-2 bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 rounded-full text-sm transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {recordedItems.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors"
                >
                  <FileDown size={16} />
                  Xuất file
                </button>
                <button 
                  onClick={sendEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Send size={16} />
                  Gửi Cường
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Left Column: Catalog */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 px-1">Danh mục thực phẩm</h2>
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                >
                  <span className="font-medium text-stone-800">{category.name}</span>
                  {expandedCategories.includes(category.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                
                <AnimatePresence>
                  {expandedCategories.includes(category.id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-stone-100 bg-stone-50/50"
                    >
                      <div className="p-2 grid grid-cols-1 gap-1">
                        {category.items.map((item) => (
                          <button
                            key={item}
                            onClick={() => addItem(item, category.name)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-sm text-stone-600 transition-all group"
                          >
                            <span>{item}</span>
                            <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recorded Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Danh sách đã ghi ({recordedItems.length})</h2>
            {recordedItems.length > 0 && (
              <div className="flex items-center gap-2 md:hidden">
                <button 
                  onClick={exportPDF}
                  className="p-2 bg-stone-100 text-stone-700 rounded-full hover:bg-stone-200 transition-colors"
                  title="Xuất file"
                >
                  <FileDown size={18} />
                </button>
                <button 
                  onClick={sendEmail}
                  className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow-sm"
                  title="Gửi Cường"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {recordedItems.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-stone-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="bg-stone-100 p-4 rounded-full text-stone-400 mb-4">
                  <Plus size={32} />
                </div>
                <p className="text-stone-500 font-medium">Chưa có thực phẩm nào được chọn</p>
                <p className="text-stone-400 text-sm mt-1">Chọn thực phẩm từ danh mục bên trái để bắt đầu ghi giá</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {recordedItems.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-stone-900">{item.name}</h3>
                        <p className="text-xs text-stone-400 uppercase tracking-wide">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-stone-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Đơn giá (VNĐ)</label>
                        <input 
                          type="number" 
                          value={item.price || ''} 
                          onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Số lượng</label>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Đơn vị</label>
                        <select 
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="con">con</option>
                          <option value="cái">cái</option>
                          <option value="quả">quả</option>
                          <option value="bó">bó</option>
                          <option value="túi">túi</option>
                          <option value="lít">lít</option>
                          <option value="chai">chai</option>
                          <option value="hộp">hộp</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Thành tiền</label>
                        <div className="px-3 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-sm border border-emerald-100">
                          {new Intl.NumberFormat('vi-VN').format(item.total)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* Footer Summary (Sticky on Mobile) */}
      {recordedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-shrink-0">
              <p className="text-[10px] text-stone-400 uppercase font-bold">Tổng cộng</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-700">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button 
                onClick={exportPDF}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FileDown size={18} />
                <span>Xuất file</span>
              </button>
              <button 
                onClick={sendEmail}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                <span>Gửi Cường</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50 pointer-events-none"
          >
            <CheckCircle2 size={20} className="text-emerald-400" />
            <span className="text-sm font-medium">Đã thêm vào danh sách</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden PDF Content Template (Off-screen for html2pdf compatibility) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', zIndex: -1 }}>
        <div id="pdf-content" className="bg-white text-black font-sans" style={{ width: '190mm', boxSizing: 'border-box' }}>
          <div className="text-center mb-8 pt-4">
            <h1 className="text-3xl font-bold uppercase tracking-tight" style={{ color: '#065f46', margin: '0' }}>Danh Sách Giá Thực Phẩm</h1>
            <p className="mt-2" style={{ color: '#6b7280', margin: '8px 0 0 0' }}>Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>

          <table className="w-full border-collapse border" style={{ borderColor: '#d1d5db', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#059669', color: '#ffffff' }}>
                <th className="border p-2 text-left" style={{ borderColor: '#d1d5db', width: '35px' }}>STT</th>
                <th className="border p-2 text-left" style={{ borderColor: '#d1d5db', width: 'auto' }}>Tên món</th>
                <th className="border p-2 text-left" style={{ borderColor: '#d1d5db', width: '80px' }}>Loại</th>
                <th className="border p-2 text-center" style={{ borderColor: '#d1d5db', width: '40px' }}>SL</th>
                <th className="border p-2 text-center" style={{ borderColor: '#d1d5db', width: '45px' }}>ĐVT</th>
                <th className="border p-2 text-right" style={{ borderColor: '#d1d5db', width: '85px' }}>Đơn giá</th>
                <th className="border p-2 text-right" style={{ borderColor: '#d1d5db', width: '95px' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {recordedItems.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                  <td className="border p-2 text-sm" style={{ borderColor: '#d1d5db' }}>{index + 1}</td>
                  <td className="border p-2 text-sm font-medium" style={{ borderColor: '#d1d5db', wordBreak: 'break-word' }}>{item.name}</td>
                  <td className="border p-2 text-sm" style={{ borderColor: '#d1d5db', color: '#4b5563', wordBreak: 'break-word' }}>{item.category}</td>
                  <td className="border p-2 text-sm text-center" style={{ borderColor: '#d1d5db' }}>{item.quantity}</td>
                  <td className="border p-2 text-sm text-center" style={{ borderColor: '#d1d5db' }}>{item.unit}</td>
                  <td className="border p-2 text-sm text-right" style={{ borderColor: '#d1d5db' }}>{new Intl.NumberFormat('vi-VN').format(item.price)}</td>
                  <td className="border p-2 text-sm text-right font-semibold" style={{ borderColor: '#d1d5db' }}>{new Intl.NumberFormat('vi-VN').format(item.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#ecfdf5', fontWeight: 'bold', color: '#064e3b' }}>
                <td colSpan={6} className="border p-3 text-right" style={{ borderColor: '#d1d5db' }}>Tổng cộng:</td>
                <td className="border p-3 text-right font-bold" style={{ borderColor: '#d1d5db' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-12 pb-8 text-center text-sm italic" style={{ color: '#9ca3af' }}>
            Cảm ơn bạn đã sử dụng ứng dụng Quản Lý Giá Thực Phẩm
          </div>
        </div>
      </div>
    </div>
  );
}
