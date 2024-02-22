import RFZLogo from '@/assets/svg/rfz-logo.svg'

const WeddingOverview = () => {
  return (
    <main>
      <article className='flex flex-col'>
        <header className='h-[1000px] bg-gradient-to-b from-black to-zinc-950'>
          <div className='relative mx-auto mt-14 flex w-[272px] flex-col'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-500 text-4xl text-black'>
              <RFZLogo />
            </div>
            <h1 className='sr-only'>RFZ Wedding</h1>
            <p className='mt-6 text-center text-[32px] font-semibold leading-9 tracking-tight'>
              Undangan nikah itu gak&nbsp;pake&nbsp;ribet.
            </p>
            <p className='mt-3 text-center text-xl leading-6 text-white/80'>
              Upload foto, pilih tema, tulis tamu, atur komentar, semua fitur
              dalam genggamanmu.
            </p>
            <button className='mx-auto mt-6 inline-flex h-11 items-center rounded-full bg-blue-600 px-6 font-semibold text-white'>
              Coba gratis*
            </button>
          </div>
        </header>
        <section className='flex flex-col'>
          <div className='mx-auto mt-[96px] max-w-[220px]'>
            <h2 className='mt-3 text-[32px] font-semibold leading-9 tracking-tight'>
              Instan edit. Instan simpan. Reaktivitas di segala sisi.
            </h2>
            <p className='mt-3 text-white/60'>
              Dibuat dengan teknologi terbaru dalam dunia web untuk menghasilkan
              apli&shy;kasi yang intuitif. Cepatnya navigasi antar halaman dan
              respon app, membuat Anda serta tamu Anda merasa&shy;kan
              kenya&shy;manan yang luar biasa dalam berinteraksi.
            </p>
          </div>
          <div className='mx-auto mt-12 h-[320px] w-[320px] bg-zinc-900'></div>
          <div className='mx-auto mt-12 max-w-[220px] space-y-10'>
            <p className='text-white/60'>
              <b className='text-white'>Instant feedback</b>. Apa yang Anda
              lihat sesuai dengan apa yang Anda tulis tanpa harus refresh
              halaman.
            </p>
            <p className='text-white/60'>
              <b className='text-white'>Simpan otomatis</b>. Lupakan
              {' ' + '"lupa simpan"'} dan menulis ulang. No, No. Di desain untuk
              menyimpan secara efektif ketika Anda selesai menulis.
            </p>
            <p className='text-white/60'>
              <b className='text-white'>Map otomatis</b>. Menulis alamat secara
              tidak lang&shy;sung menempatkan titik pada google maps.
            </p>
          </div>
        </section>
      </article>
    </main>
  )
}

export default WeddingOverview
