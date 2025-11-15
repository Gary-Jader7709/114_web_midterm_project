# 迷你待辦清單（Mini To-Do List）

## 組員
郭秉逸 412637935 資管系4A

## 專案簡介
這是一個「迷你待辦清單」網頁應用。  
使用者可以新增待辦事項、設定類別、截止日期與優先順序，並在清單中標記完成、編輯或刪除項目。  
資料會暫存在瀏覽器的 localStorage 中，重新整理後仍可保留。

## 使用技術
- HTML5 語意化標籤
- CSS3 + Bootstrap 5（RWD 排版）
- 原生 JavaScript（ES6）
- DOM 操作（querySelector、addEventListener、createElement、closest、dataset）
- HTML5 Constraint Validation API（setCustomValidity、validationMessage）
- localStorage

## 功能特色
1. **新增待辦事項**
   - 必填欄位：事項內容、類別、優先順序。
   - 可選欄位：截止日期（不可早於今天）。
2. **表單驗證與 UX**
   - 使用 Constraint Validation API 自訂錯誤訊息。
   - blur 後開始顯示錯誤，input 時即時更新。
   - 送出時會聚焦第一個錯誤欄位，避免使用者迷路。
3. **待辦清單管理**
   - 勾選核取方塊可切換完成狀態（事件委派）。
   - 支援編輯與刪除單筆項目。
   - 可清除全部、或只清除已完成項目。
4. **篩選功能**
   - 依狀態切換顯示「全部 / 未完成 / 已完成」。
5. **localStorage 暫存**
   - 自動儲存目前待辦清單。
   - 重新整理頁面後仍能保留資料。

## GitHub Pages 網址

