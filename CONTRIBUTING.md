# Katkıda Bulunma Rehberi (Contributing Guide)

**Hızlı Okuma Web** projesine katkıda bulunmak istediğiniz için teşekkür ederiz! 🎉

## 🛠️ Yerel Geliştirme Ortamı

1. **Repoyu klonlayın**:
   ```bash
   git clone https://github.com/resulaykan/hizli-okuma-web.git
   cd hizli-okuma-web
   ```

2. **Bağımlılıkları yükleyin**:
   ```bash
   npm install
   ```

3. **Geliştirme sunucusunu başlatın**:
   ```bash
   npm run dev
   ```
   Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

4. **Kod kalitesi & Test**:
   ```bash
   npm run lint
   npm run build
   ```

## 📜 Kurallar
- Kodunuzun `npm run lint` ve `npm run build` kontrollerinden 0 hata ile geçmesi gerekmektedir.
- Yeni özellikler için açıklayıcı commit mesajları (`feat:`, `fix:`, `style:`, `docs:`) kullanın.
- Her türlü geri bildirim ve PR (Pull Request) memnuniyetle karşılanır!
