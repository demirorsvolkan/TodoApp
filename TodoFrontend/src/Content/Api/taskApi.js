export async function getSubTasks(token,taskId) {
  
  const res = await fetch(`https://localhost:7299/api/SubTask/list/${taskId}`, {
    method: 'GET', 
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error('API isteği başarısız');
  }

  return res.json();
}
export async function getTasks(token,categoryId) {
  const res = await fetch(`https://localhost:7299/api/Task/list/${categoryId}`, {
    method: 'GET', 
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error('API isteği başarısızss');
  }

  return res.json();
}
export async function getCategories(token) {
  
  const res = await fetch(`https://localhost:7299/api/Category/list`, {
    method: 'GET', 
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error('API isteği başarısız');
  }

  return res.json();
}
export async function getCategory(token, id){
    const res = await fetch(`https://localhost:7299/api/Category/get/${id}`, {
    method: 'GET', 
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error('API isteği başarısız');
  }

  return res.json();

}
export async function updateSubTask(token,updatedTaskData) {

  try {
    const response = await fetch(`https://localhost:7299/api/SubTask/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Varsa token
      },
      body: JSON.stringify(updatedTaskData)
    });

    if (!response.ok) {
      console.log("Gönderilen güncel görev verisi:", updatedTaskData);
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    console.log("Gönderilen güncel görev verisi:", updatedTaskData);
    const result = await response.json();
    console.log("Görev başarıyla güncellendi:", result);
    return result;
  } catch (error) {
    console.error("Güncelleme hatası:", error.message);
    throw error;
  }
}

export async function updateTask(token,updatedTaskData) {

  try {
    const response = await fetch(`https://localhost:7299/api/Task/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Varsa token
      },
      body: JSON.stringify(updatedTaskData)
    });

    if (!response.ok) {
      console.log("Gönderilen güncel görev verisi:", updatedTaskData);
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    console.log("Gönderilen güncel görev verisi:", updatedTaskData);
    const result = await response.json();
    console.log("Görev başarıyla güncellendi:", result);
    return result;
  } catch (error) {
    console.error("Güncelleme hatası:", error.message);
    throw error;
  }
}

export async function updateCategory(token,updatedCategoryData) {

  try {
    const response = await fetch(`https://localhost:7299/api/Category/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedCategoryData)
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    const result = await response.json();
    console.log("Board başarıyla güncellendi:", result);
    return result;
  } catch (error) {
    console.error("Güncelleme hatası:", error.message);
    throw error;
  }
}

export async function addTask(token,addedTaskData) {
  try {
    const response = await fetch(`https://localhost:7299/api/Task/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Varsa token
      },
      body: JSON.stringify(addedTaskData)
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    const result = await response.json();
    console.log("Görev başarıyla güncellendi:", result);
    return result;
  } catch (error) {
    console.error("Güncelleme hatası:", error.message);
    throw error;
  }
}
export async function addSubTask(token,addedSubTaskData) {
  try {
    const response = await fetch(`https://localhost:7299/api/SubTask/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Varsa token
      },
      body: JSON.stringify(addedSubTaskData)
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    const result = await response.json();
    console.log("Görev başarıyla güncellendi:", result);
    return result;
  } catch (error) {
    console.error("Güncelleme hatası:", error.message);
    throw error;
  }
}

export async function addCategory(token,addedCategoryData) {
  try {
    const response = await fetch(`https://localhost:7299/api/Category/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Varsa token
      },
      body: JSON.stringify(addedCategoryData)
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function deleteSubTask(token, subTaskId) {
  try {
    const response = await fetch(`https://localhost:7299/api/SubTask/delete/${subTaskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Token varsa ekle
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }

    const result = await response.json();
    console.log("Görev başarıyla silindi:", result);
    return result;

  } catch (error) {
    console.error("Silme hatası:", error.message);
    throw error;
  }
}

export async function deleteTask(token, taskId) {
  try {
    const response = await fetch(`https://localhost:7299/api/Task/delete/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Token varsa ekle
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }

    const result = await response.json();
    console.log("Görev başarıyla silindi:", result);
    return result;

  } catch (error) {
    console.error("Silme hatası:", error.message);
    throw error;
  }
}

export async function deleteCategory(token, categoryId) {
  try {
    const response = await fetch(`https://localhost:7299/api/Category/delete/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` // Token varsa ekle
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }

    const result = await response.json();
    console.log("Başarıyla silindi:", result);
    return result;

  } catch (error) {
    console.error("Silme hatası:", error.message);
    throw error;
  }
}


export async function reorderTask(token,taskId,newOrder) {

  try {
    const response = await fetch(`https://localhost:7299/api/Task/${taskId}?newOrder=${newOrder}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    const result = await response.json();
    console.log("Task başarıyla güncellendi:", result);
    return result;
  } catch (error) {
    console.error("Güncelleme hatası:", error.message);
    throw error;
  }
}
export async function reorderSubTask(token,taskId,newOrder) {

  try {
    const response = await fetch(`https://localhost:7299/api/SubTask/${taskId}?newOrder=${newOrder}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    const result = await response.json();
    console.log("SubTask başarıyla güncellendi:", result);
    return result;
  } catch (error) {
    console.error("Güncelleme hatası:", error.message);
    throw error;
  }
}

export async function reorderCategory(token,categoryId,newOrder) {

  try {
    const response = await fetch(`https://localhost:7299/api/Category/${categoryId}?newOrder=${newOrder}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    const result = await response.json();
    console.log("Board başarıyla güncellendi:", result);
    return result;
  } catch (error) {
    console.error("Güncelleme hatası:", error.message);
    throw error;
  }
}

export async function downloadTemplate(token) {
  try {
    const response = await fetch('https://localhost:7299/api/Task/template', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TaskTemplate.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Dosya indirme hatası:', error);
  }
}
export async function downloadTaskList(token, categoryId, withSub) {
  try {
    const response = await fetch(`https://localhost:7299/api/Task/listWithFile/${categoryId}/${withSub}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { status: 404, message: 'Kaynak bulunamadı (404)' };
      } else {
        return { status: 777, message: 'İndirme hatası (777)' };
      }
    }

const disposition = response.headers.get('content-disposition');
let fileName = 'TaskList.xlsx';

if (disposition) {
  let match = disposition.match(/filename\*\=UTF-8''(.+?)(;|$)/);
  if (match && match[1]) {
    fileName = decodeURIComponent(match[1]);
  } else {
    match = disposition.match(/filename=\"?([^\";]+)\"?/);
    if (match && match[1]) {
      fileName = match[1];
    }
  }
}
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return { status: 200, message: 'Başarılı' };
  } catch (error) {
    console.error('Dosya indirme hatası:', error);
    return { status: 500, message: 'Sunucu hatası' };
  }
}


export async function downloadSubTaskList(token,id) {
  try {
    const response = await fetch(`https://localhost:7299/api/SubTask/listWithFile/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { status: 404, message: 'Kaynak bulunamadı (404)' };
      }else{
        return { status: 777, message: 'Kaynak bulunamadı (777)' };
      }
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TaskList.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return { status: 200, message: 'Başarılı' };
  } catch (error) {
    console.error('Dosya indirme hatası:', error);
  }
}

export async function uploadTaskTemplateFile(token, file, categoryId) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`https://localhost:7299/api/Task/check/${categoryId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}
export async function forceUploadTaskTemplateFile(token, file, categoryId) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`https://localhost:7299/api/Task/upload_force/${categoryId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}


export async function uploadSubTaskTemplateFile(token, file, id) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`https://localhost:7299/api/SubTask/check/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}
export async function forceUploadSubTaskTemplateFile(token, file, id) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`https://localhost:7299/api/SubTask/upload_force/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}
