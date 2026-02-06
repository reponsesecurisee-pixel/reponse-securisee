import { useState, useEffect } from 'react';

export default function Admin() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    localStorage.setItem('is_admin', 'true');

    setTitle(localStorage.getItem('site_title') || '');
    setSubtitle(localStorage.getItem('site_subtitle') || '');
    setDescription(localStorage.getItem('site_description') || '');
  }, []);

  const save = () => {
    localStorage.setItem('site_title', title);
    localStorage.setItem('site_subtitle', subtitle);
    localStorage.setItem('site_description', description);
    alert('Сохранено');
  };

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <h1>Админка</h1>

      <label>Заголовок</label>
      <input value={title} onChange={e => setTitle(e.target.value)} />

      <br /><br />

      <label>Подзаголовок</label>
      <input value={subtitle} onChange={e => setSubtitle(e.target.value)} />

      <br /><br />

      <label>Описание</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} />

      <br /><br />

      <button onClick={save}>Сохранить</button>
    </div>
  );
}
