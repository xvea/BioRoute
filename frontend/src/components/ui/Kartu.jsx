/**
 * Kartu putih bergaris tepi, wadah konten utama di halaman admin.
 * Gaya dasar kartu diatur di sini; padding dan tata letak ditambahkan lewat className.
 * Prop "as" memilih tag HTML-nya (article, section, aside), bawaannya div.
 */
export default function Kartu({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-kartu bg-white border border-garis shadow-xs ${className}`} {...props}>
      {children}
    </Tag>
  );
}
