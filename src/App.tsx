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

      // Try Web Share API (Best for mobile)
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
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30 pt-safe px-4 pb-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                <ShoppingCart size={20} />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-emerald-900">Giá Thực Phẩm</h1>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              {recordedItems.length > 0 && (
                <>
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
                </>
              )}
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm thực phẩm..." 
              className="w-full pl-9 pr-4 py-2 bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 rounded-xl text-sm transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Catalog */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Danh mục thực phẩm</h2>
          </div>
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-stone-50 transition-colors"
                >
                  <span className="font-semibold text-stone-800 text-sm">{category.name}</span>
                  <motion.div
                    animate={{ rotate: expandedCategories.includes(category.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} className="text-stone-400" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {expandedCategories.includes(category.id) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-stone-100 bg-stone-50/30"
                    >
                      <div className="p-1.5 grid grid-cols-1 gap-1">
                        {category.items.map((item) => (
                          <button
                            key={item}
                            onClick={() => addItem(item, category.name)}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-sm text-stone-600 transition-all group active:scale-[0.98]"
                          >
                            <span className="text-left">{item}</span>
                            <Plus size={16} className="text-emerald-500" />
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
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Đã ghi ({recordedItems.length})</h2>
          </div>

          <div className="space-y-3">
            {recordedItems.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-stone-200 p-10 flex flex-col items-center justify-center text-center">
                <div className="bg-stone-100 p-4 rounded-full text-stone-300 mb-4">
                  <Plus size={28} />
                </div>
                <p className="text-stone-500 font-semibold text-sm">Chưa có thực phẩm nào</p>
                <p className="text-stone-400 text-xs mt-1">Chọn thực phẩm từ danh mục để bắt đầu</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {recordedItems.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-3.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold text-stone-900 leading-tight break-words">{item.name}</h3>
                        <p className="text-[10px] text-stone-400 uppercase font-bold mt-0.5">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-stone-300 hover:text-red-500 transition-colors p-1.5 -mr-1.5 -mt-1.5"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2.5">
                      <div className="col-span-5 space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">Đơn giá (đ)</label>
                        <input 
                          type="number" 
                          inputMode="decimal"
                          value={item.price || ''} 
                          onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">SL</label>
                        <input 
                          type="number" 
                          inputMode="decimal"
                          value={item.quantity} 
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="col-span-4 space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">Đơn vị</label>
                        <div className="relative">
                          <select 
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                            className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all"
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
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="col-span-12 pt-1 border-t border-stone-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Thành tiền</span>
                        <span className="text-base font-black text-emerald-600">
                          {new Intl.NumberFormat('vi-VN').format(item.total)}<span className="text-xs ml-0.5">đ</span>
                        </span>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-stone-200 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40">
          <div className="max-w-5xl mx-auto p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider">Tổng thanh toán</span>
                <span className="text-2xl font-black text-emerald-700 leading-none">
                  {new Intl.NumberFormat('vi-VN').format(grandTotal)}<span className="text-sm ml-1">đ</span>
                </span>
              </div>
              <div className="bg-emerald-50 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-emerald-700">{recordedItems.length} món</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={exportPDF}
                className="flex-1 px-4 py-3 bg-stone-100 text-stone-700 rounded-2xl font-bold text-sm hover:bg-stone-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FileDown size={18} />
                <span>Xuất PDF</span>
              </button>
              <button 
                onClick={sendEmail}
                className="flex-[1.5] px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 flex items-center justify-center gap-2"
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
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-2xl z-50 pointer-events-none"
          >
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-xs font-bold">Đã thêm vào danh sách</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden PDF Content Template (Off-screen for html2pdf compatibility) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', zIndex: -1 }}>
        <div id="pdf-content" className="bg-white text-black font-sans" style={{ width: '190mm', boxSizing: 'border-box', padding: '10mm' }}>
          <div className="text-center mb-10">
            <h1 style={{ fontSize: '24pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#065f46', margin: '0' }}>Danh Sách Giá Thực Phẩm</h1>
            <p style={{ fontSize: '11pt', color: '#6b7280', marginTop: '8pt' }}>Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#059669', color: '#ffffff' }}>
                <th style={{ border: '1px solid #d1d5db', padding: '8pt', textAlign: 'left', width: '30pt' }}>STT</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8pt', textAlign: 'left' }}>Tên món</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8pt', textAlign: 'left', width: '80pt' }}>Loại</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8pt', textAlign: 'center', width: '40pt' }}>SL</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8pt', textAlign: 'center', width: '40pt' }}>ĐVT</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8pt', textAlign: 'right', width: '80pt' }}>Đơn giá</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8pt', textAlign: 'right', width: '90pt' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {recordedItems.map((item, index) => (
                <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                  <td style={{ border: '1px solid #d1d5db', padding: '8pt', fontSize: '10pt' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8pt', fontSize: '10pt', fontWeight: 'bold', wordBreak: 'break-word' }}>{item.name}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8pt', fontSize: '9pt', color: '#4b5563', wordBreak: 'break-word' }}>{item.category}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8pt', fontSize: '10pt', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8pt', fontSize: '10pt', textAlign: 'center' }}>{item.unit}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8pt', fontSize: '10pt', textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(item.price)}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8pt', fontSize: '10pt', textAlign: 'right', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(item.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#ecfdf5', fontWeight: 'bold', color: '#064e3b' }}>
                <td colSpan={6} style={{ border: '1px solid #d1d5db', padding: '12pt', textAlign: 'right', fontSize: '11pt' }}>Tổng thanh toán:</td>
                <td style={{ border: '1px solid #d1d5db', padding: '12pt', textAlign: 'right', fontSize: '12pt', fontWeight: '900' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ marginTop: '40pt', textAlign: 'center', fontSize: '10pt', fontStyle: 'italic', color: '#9ca3af' }}>
            Cảm ơn bạn đã sử dụng ứng dụng Quản Lý Giá Thực Phẩm
          </div>
        </div>
      </div>
    </div>
  );
}
