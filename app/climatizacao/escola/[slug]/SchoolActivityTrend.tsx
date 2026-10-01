import styles from "./activity.module.css";

type Row={
  day:string;
  metric:string;
  channel:string;
  count:number;
  updated_at:string;
};

const labels:Record<string,string>={
  report:"relatos",
  student_support:"apoios estudantis",
  signature:"assinaturas ligadas à escola",
  evidence_submission:"fontes sugeridas",
  push_subscribe:"alertas ativados",
};

function key(date:Date){
  return date.toISOString().slice(0,10);
}

export default function SchoolActivityTrend({
  totals,
  series,
  days,
}:{
  totals:Record<string,number>;
  series:Row[];
  days:number;
}){
  const total=Object.values(totals).reduce((sum,value)=>sum+Number(value||0),0);
  const byDay=new Map<string,number>();
  for(const row of series){
    byDay.set(row.day,(byDay.get(row.day)??0)+Number(row.count||0));
  }

  const today=new Date();
  const visible=Array.from({length:14},(_,index)=>{
    const date=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()-(13-index)));
    const day=key(date);
    return {day,count:byDay.get(day)??0,label:date.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})};
  });
  const max=Math.max(1,...visible.map(item=>item.count));

  return <section className={styles.section} aria-label="Atividade agregada da escola">
    <div className={styles.head}>
      <span>TELEMETRIA AGREGADA · {days} DIAS</span>
      <h2>Contamos ações. Não pessoas.</h2>
      <p>Somente ações válidas ligadas a esta escola entram aqui. Não há cookie de campanha, perfil individual ou histórico pessoal nesta série.</p>
    </div>

    <div className={styles.totals}>
      <article><strong>{total}</strong><span>ações registradas</span></article>
      {Object.entries(labels).map(([metric,label])=><article key={metric}>
        <strong>{totals[metric]??0}</strong><span>{label}</span>
      </article>)}
    </div>

    <div className={styles.chart} role="img" aria-label={"Atividade agregada dos últimos 14 dias; pico de "+max+" ação(ões) em um dia."}>
      {visible.map(item=><div className={styles.column} key={item.day}>
        <div className={styles.barBox}><i style={{height:item.count?Math.max(8,Math.round((item.count/max)*100))+"%":"2px"}} title={item.count+" ação(ões)"} /></div>
        <b>{item.count}</b>
        <small>{item.label}</small>
      </div>)}
    </div>

    <p className={styles.note}>A série não mede visualizações de página nem tenta identificar visitante. Ela contabiliza apenas ações concluídas no sistema.</p>
  </section>;
}
