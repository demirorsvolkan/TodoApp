import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { getCategories, addCategory, deleteCategory, updateCategory } from './Api/taskApi'; 
import { useAuth } from './AuthContext';

const Navbar = forwardRef(function Navbar({ onFilter, onFilterChange, onAlert, setOnAlert, onAccept, setOnAccept }, ref) {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [addBoard, setAddBoard] = useState(false);
  const [deleteBoard, setDeleteBoard] = useState(null);
  const [deletedBoard, setDeletedBoard] = useState(null);
  const [addConfirm, setAddConfirm] = useState(false);
  const [updateConfirm, setUpdateConfirm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [updatedCategoryName, setUpdatedCategoryName] = useState('');
  const addRef = useRef();
  const [isUpdating, setIsUpdating] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [lastCategory, setLastCategory] = useState(0);
  const menuRef = useRef();
  const updatingRef = useRef();



  useEffect(() => {
    async function fetchCategories() {
      if (!token) return;
      try {
        const data = await getCategories(token);
        setCategories(data);
      } catch (error) {
        console.error("Kategori yüklenirken hata:", error);
      }
    }
    fetchCategories();
  }, [token]);

    async function handleAddCategory() {
      if (!token || !newCategoryName.trim() || !addBoard) return;

      try {
        const newCategory = {
          id: 0,
          userId: "",
          categoryOrder: 0,
          categoryName: newCategoryName.trim()
        };

        await addCategory(token, newCategory);
        const updated = await getCategories(token);
        setCategories(updated);
        setNewCategoryName("");
        setAddConfirm(true);
        setTimeout(() => {
          setAddConfirm(false);  
          setAddBoard(false);    
        }, 300);

      } catch (error) {
        console.error("Kategori eklenemedi:", error);
      }
    }

    async function handleUpdateCategory() {
      if (!token || !updatedCategoryName.trim() || !isUpdating) return;

      try {
        const newCategory = {
          id: isUpdating,
          userId: "",
          categoryOrder: 0,
          categoryName: updatedCategoryName.trim()
        };

        await updateCategory(token, newCategory);
        const updated = await getCategories(token);
        setCategories(updated);
        setUpdatedCategoryName("");
        setUpdateConfirm(true);
        setTimeout(() => {
          setUpdateConfirm(false);  
          setIsUpdating(null);    
        }, 300);
      } catch (error) {
        console.error("Kategori güncellenemedi:", error);
      }
    }

    const useClickOutside = (ref, handler, when = true, exceptionClasses = []) => {
      useEffect(() => {
        if (!when) return;

        const listener = (e) => {
          const isExceptionClick = exceptionClasses.some((cls) =>
            e.target.closest(`.${cls}`)
          );

          if (isExceptionClick) return;
          if (!ref.current || ref.current.contains(e.target)) return;

          setTimeout(() => {
            handler(e);
          }, 0);
        };

        document.addEventListener("click", listener);
        return () => {
          document.removeEventListener("click", listener);
        };
      }, [handler, when, exceptionClasses]);
    };

    useClickOutside(addRef, () => setAddBoard(false), addBoard,['add-board-form']);
    useClickOutside(menuRef, () => setOpenMenuId(null), openMenuId,[`dropdown-list-${openMenuId}`]);
    useClickOutside(updatingRef, () => setIsUpdating(null), isUpdating,['add-board-form']);





    useEffect(() => {
      if (deleteBoard === null) return; 
      if (deleteBoard !==null && onAccept){
        try {
            setDeletedBoard(deleteBoard);
            deleteCategory(token, deleteBoard);
            setOnAlert(false);
            setTimeout(() => {
              setCategories(prevCategories => {
                const updated = prevCategories.filter(category => category.id !== deleteBoard);
                const sorted = [...updated].sort((a, b) => a.categoryOrder - b.categoryOrder);
                setLastCategory(sorted[sorted.length - 1]);
                return updated;
              });
              setDeleteBoard(null);
              setOnAccept(false);
            }, 500);
        } catch (error) {
          console.error('Silme hatası:', error);
        }
      }
    }, [deleteBoard, onAccept]);
    
useEffect(() => {
  if(deletedBoard){
  if (deletedBoard === onFilter && lastCategory) {
    onFilterChange(lastCategory.id);
  }else if(deletedBoard !== onFilter && lastCategory){
  setDeletedBoard(null);
  }
  }
}, [deletedBoard, lastCategory, onFilter, onFilterChange]);




  return (
    <nav className="navbar" ref={ref}>
      <ul className="navbar_list">
        {categories.map(category => (
          <div 
            key={category.id} 
            className={`categoryButtonWrapper ${deleteBoard === category.id && onAccept ? 'deleted' : ''} ${isUpdating === category.id ? 'updating' : ''}`}
            ref={menuRef} 
            >
            
            {isUpdating !== category.id && (
            <>
              <button
                className="categoryButton"
                onClick={() => onFilterChange(category.id)}
              >
              {category.categoryName}
            </button>
              <button
              onClick={(e) =>{
                e.stopPropagation();
                setOpenMenuId(prev => (prev === category.id ? null : category.id));
              }
              }
              className="categoryDropdownButton"
            >
              ⋮
            </button>
            </>)}

            {isUpdating === category.id && (
            <li className='navbar_list board-update' ref={updatingRef}>
            <div className='add-board-form'>
              <input
                className="add-board-input"
                type="text"
                disabled={updateConfirm}
                value={updatedCategoryName}
                onChange={(e) => setUpdatedCategoryName(e.target.value)} />
              <button className='add-board-save-button' disabled={updateConfirm} onClick={handleUpdateCategory}></button></div>
              <button onClick={() => {
                setIsUpdating(null);
                setUpdatedCategoryName(category.categoryName);}} 
                className={`add-board-button ${
                isUpdating !==null
                  ? updateConfirm
                    ? 'ok'
                    : 'cancel'
                  : ''
                  }`}
                  >
                    {isUpdating !== null
                      ? updateConfirm
                        ? 'Güncellendi'
                        : 'İptal'
                      : 'Board Güncelle'}
                <div></div></button>
            </li>)}

            {openMenuId === category.id && (
              <ul className={`dropdown-list board dropdown-list-${category.id}`}>
                <li onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setIsUpdating(category.id);
                        setUpdatedCategoryName(category.categoryName);
                  }}>Düzenle</li>
                <li
                  onClick={() => {
                    setDeleteBoard(category.id);
                    setOnAlert(true);
                    setOpenMenuId(null);
                  }}
                >
                  Sil
                </li>
              </ul>
            )}
          </div>
        ))}
      </ul>


      <ul className='navbar_list board-add' ref={addRef}>
       {addBoard && (<div className='add-board-form'>
        <input   placeholder="Giriniz..."
          className="add-board-input"
          type="text"
          disabled={addConfirm}
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)} />
          <button className='add-board-save-button' disabled={addConfirm} onClick={handleAddCategory}></button></div>)}
        <button onClick={() => {
          setAddBoard(prev => !prev);
          setNewCategoryName("");}} 
          className={`add-board-button ${
          addBoard
            ? addConfirm
              ? 'ok'
              : 'cancel'
            : ''
            }`}
            >
              {addBoard
                ? addConfirm
                  ? 'Eklendi'
                  : 'İptal'
                : 'Yeni Board'}
          <div></div></button>
      </ul>
    </nav>
  );
});

export default Navbar;
