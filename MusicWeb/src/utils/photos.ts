import one from '@/assets/coverphotos/1.png'
import two from '@/assets/coverphotos/2.png'
import three from '@/assets/coverphotos/3.png'
import four from '@/assets/coverphotos/4.png'
import five from '@/assets/coverphotos/5.png'
import six from '@/assets/coverphotos/6.png'
import seven from '@/assets/coverphotos/7.png'
import eight from '@/assets/coverphotos/8.png'
import nine from '@/assets/coverphotos/9.png'
import ten from '@/assets/coverphotos/10.png'
import eleven from '@/assets/coverphotos/11.png'
import twelve from '@/assets/coverphotos/12.png'
let photos = [one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve]
export default function(){
    return photos[Math.floor(Math.random() * photos.length)]
}